import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const getAllowedOrigins = (): string[] => {
  const envOrigins = Deno.env.get("ALLOWED_ORIGINS");
  if (envOrigins) {
    return envOrigins.split(",").map(o => o.trim());
  }
  // Default to Lovable preview URLs and localhost for development
  return [
    "https://lovable.dev",
    "https://id-whjbciwdpwiyjkcrlsfy.lovable.app",
    "http://localhost:5173",
    "http://localhost:3000",
  ];
};

const getCorsHeaders = (req: Request): Record<string, string> => {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigins = getAllowedOrigins();
  const isAllowed = allowedOrigins.some(allowed => 
    origin === allowed || origin.endsWith(".lovable.app") || origin.endsWith(".lovable.dev")
  );
  
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Authenticate the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      throw new Error("Invalid authentication");
    }

    console.log("Authenticated user:", user.id);

    // Verify user has institute_admin role
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const hasAdminRole = roles?.some(r => r.role === "institute_admin");
    if (!hasAdminRole) {
      console.error("User lacks admin role:", user.id);
      throw new Error("Insufficient permissions. Only institute admins can create teachers.");
    }

    // Get admin's institute
    const { data: adminProfile } = await supabaseAdmin
      .from("profiles")
      .select("institute_id")
      .eq("id", user.id)
      .single();

    if (!adminProfile?.institute_id) {
      throw new Error("Admin is not associated with any institute");
    }

    const { email, password, fullName, phone, instituteId, employeeId, qualification, subjects, salary } = await req.json();
    console.log("Creating teacher account:", email, fullName, instituteId);

    if (!email || !password || !fullName || !instituteId) {
      throw new Error("Missing required fields: email, password, fullName, instituteId");
    }

    // Verify admin belongs to the target institute
    if (adminProfile.institute_id !== instituteId) {
      console.error("Institute mismatch:", adminProfile.institute_id, "vs", instituteId);
      throw new Error("Cannot create teachers for other institutes");
    }

    // 1. Create auth user
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError) {
      console.error("Error creating user:", createError);
      throw createError;
    }

    console.log("Auth user created:", userData.user.id);

    // 2. Update profile with institute
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        institute_id: instituteId,
        phone: phone || null,
      })
      .eq("id", userData.user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      throw profileError;
    }

    // 3. Add teacher role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: userData.user.id,
        role: "teacher",
      });

    if (roleError) {
      console.error("Error adding role:", roleError);
      throw roleError;
    }

    // 4. Create teacher record
    const { error: teacherError } = await supabaseAdmin
      .from("teachers")
      .insert({
        profile_id: userData.user.id,
        institute_id: instituteId,
        employee_id: employeeId || `EMP${Date.now().toString().slice(-8)}`,
        qualification: qualification || null,
        subjects: subjects || [],
        salary: salary || 0,
      });

    if (teacherError) {
      console.error("Error creating teacher record:", teacherError);
      throw teacherError;
    }

    console.log("Teacher record created successfully");

    return new Response(
      JSON.stringify({ 
        userId: userData.user.id,
        message: "Teacher account created successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error in create-teacher-account:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
