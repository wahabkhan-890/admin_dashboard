import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const buildTraceId = () => `DEL-${Math.floor(100000 + Math.random() * 900000)}`;

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const errorResponse = (
  traceId: string,
  step: string,
  message: string,
  status: number,
) =>
  jsonResponse(
    {
      success: false,
      traceId,
      step,
      message,
      error: message,
    },
    status,
  );

Deno.serve(async (req) => {
  const headerTraceId = req.headers.get("x-trace-id")?.trim();
  const baseTraceId = headerTraceId || buildTraceId();
  let traceId = baseTraceId;
  console.log(`[${traceId}] delete-account: function start`);

  if (req.method === "OPTIONS") {
    console.log(`[${traceId}] delete-account: request received (OPTIONS)`);
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.log(`[${traceId}] delete-account: request received (invalid method ${req.method})`);
    return errorResponse(traceId, "request_validation", "Method not allowed", 405);
  }

  try {
    console.log(`[${traceId}] delete-account: request received (POST)`);
    let payload: Record<string, unknown> = {};
    try {
      payload = (await req.json()) as Record<string, unknown>;
    } catch {
      payload = {};
    }
    const payloadTraceId = String(payload?.traceId || "").trim();
    if (payloadTraceId) {
      traceId = payloadTraceId;
    }
    console.log(`[${traceId}] delete-account: payload received`, { hasPayload: Object.keys(payload).length > 0 });

    // Keep default Supabase secret names first, then support project-specific EP_* aliases.
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("EP_SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("EP_SUPABASE_ANON_KEY");
    const serviceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("EP_SUPABASE_SERVICE_ROLE_KEY");
    const authHeader = req.headers.get("Authorization");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.log(`[${traceId}] delete-account: auth validation failure (missing server env)`);
      return errorResponse(traceId, "env_validation", "Server env is missing.", 500);
    }

    if (!authHeader) {
      console.log(`[${traceId}] delete-account: auth validation failure (missing auth header)`);
      return errorResponse(traceId, "auth_validation", "Missing auth header.", 401);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      console.log(`[${traceId}] delete-account: auth validation failure (unauthorized user)`);
      return errorResponse(traceId, "auth_validation", "Unauthorized user.", 401);
    }
    console.log(`[${traceId}] delete-account: auth validation success`);
    const normalizedUserEmail = String(user.email || "").trim().toLowerCase();
    if (!normalizedUserEmail) {
      return errorResponse(traceId, "auth_validation", "Authenticated user email is missing.", 400);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: deletedProfiles, error: tableError } = await adminClient
      .from("users")
      .delete()
      .ilike("email", normalizedUserEmail)
      .select("id, email");

    if (tableError) {
      console.log(`[${traceId}] delete-account: db delete failure`);
      return errorResponse(traceId, "db_delete", tableError.message, 400);
    }
    if (!deletedProfiles || deletedProfiles.length === 0) {
      // Do not block account deletion if profile row is already missing.
      console.log(`[${traceId}] delete-account: db delete skipped (no profile row matched)`);
    } else {
      console.log(`[${traceId}] delete-account: db delete success`);
    }

    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(user.id);

    if (deleteAuthError) {
      console.log(`[${traceId}] delete-account: auth delete failure`);
      return errorResponse(traceId, "auth_delete", deleteAuthError.message, 400);
    }
    console.log(`[${traceId}] delete-account: auth delete success`);
    console.log(`[${traceId}] delete-account: function end`);

    return jsonResponse({ success: true, traceId, message: "Account deleted successfully." }, 200);
  } catch (error) {
    console.log(`[${traceId}] delete-account: function error`);
    return errorResponse(traceId, "unknown", error instanceof Error ? error.message : "Unknown error", 500);
  }
});
