import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LoginRequest {
  userType: "teacher" | "student";
  identifier: string; // employee_id for teachers, roll_number/registration_number for students
  password: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { userType, identifier, password }: LoginRequest = await req.json();

    if (!userType || !identifier || !password) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Attempting ${userType} login with identifier: ${identifier}`);

    let email: string | null = null;

    if (userType === "teacher") {
      // Look up teacher by employee_id
      const { data: teacher, error: teacherError } = await supabaseAdmin
        .from("teachers")
        .select("profile_id, profiles(email)")
        .eq("employee_id", identifier)
        .eq("is_active", true)
        .single();

      if (teacherError || !teacher) {
        console.log("Teacher not found:", teacherError?.message);
        return new Response(
          JSON.stringify({ error: "Invalid credentials" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      email = (teacher.profiles as any)?.email;
    } else if (userType === "student") {
      // Look up student by roll_number or registration_number
      const { data: student, error: studentError } = await supabaseAdmin
        .from("students")
        .select("profile_id, profiles(email)")
        .or(`roll_number.eq.${identifier},registration_number.eq.${identifier}`)
        .eq("status", "active")
        .single();

      if (studentError || !student) {
        console.log("Student not found:", studentError?.message);
        return new Response(
          JSON.stringify({ error: "Invalid credentials" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      email = (student.profiles as any)?.email;
    }

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found email for ${userType}: ${email}`);

    // Attempt authentication with the found email
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.log("Auth error:", authError.message);
      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Login successful for ${userType}: ${email}`);

    return new Response(
      JSON.stringify({
        success: true,
        session: authData.session,
        user: authData.user,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred during login" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
