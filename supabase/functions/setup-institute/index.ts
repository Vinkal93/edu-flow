import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { userId, instituteName, email, phone } = await req.json();
    console.log("Setting up institute for user:", userId, instituteName);

    if (!userId || !instituteName || !email) {
      throw new Error("Missing required fields: userId, instituteName, email");
    }

    // 1. Create institute
    const { data: institute, error: instituteError } = await supabaseAdmin
      .from("institutes")
      .insert({
        name: instituteName,
        email: email,
        phone: phone || null,
      })
      .select()
      .single();

    if (instituteError) {
      console.error("Error creating institute:", instituteError);
      throw instituteError;
    }

    console.log("Institute created:", institute.id);

    // 2. Update profile with institute_id
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        institute_id: institute.id,
        phone: phone || null,
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      throw profileError;
    }

    console.log("Profile updated with institute_id");

    // 3. Add institute_admin role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: userId,
        role: "institute_admin",
      });

    if (roleError) {
      console.error("Error adding role:", roleError);
      throw roleError;
    }

    console.log("Role assigned: institute_admin");

    return new Response(
      JSON.stringify({ 
        success: true, 
        instituteId: institute.id,
        message: "Institute setup completed successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error in setup-institute:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
