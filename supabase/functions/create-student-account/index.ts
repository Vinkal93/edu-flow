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

    const { email, password, fullName, phone, instituteId } = await req.json();

    if (!email || !password || !fullName || !instituteId) {
      throw new Error("Missing required fields");
    }

    // Create user
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError) throw createError;

    // Update profile with institute
    await supabaseAdmin.from("profiles").update({
      institute_id: instituteId,
      phone: phone || null,
    }).eq("id", userData.user.id);

    // Add student role
    await supabaseAdmin.from("user_roles").insert({
      user_id: userData.user.id,
      role: "student",
    });

    return new Response(JSON.stringify({ userId: userData.user.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error creating student account:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
