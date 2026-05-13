import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type DeleteRequest = {
  targetUserId?: number | string;
  targetEmail?: string;
  traceId?: string;
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
  const traceId = headerTraceId || buildTraceId();
  console.log(`[${traceId}] admin-delete-user: function start`);

  if (req.method === "OPTIONS") {
    console.log(`[${traceId}] admin-delete-user: request received (OPTIONS)`);
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.log(`[${traceId}] admin-delete-user: request received (invalid method ${req.method})`);
    return errorResponse(traceId, "request_validation", "Method not allowed", 405);
  }

  try {
    console.log(`[${traceId}] admin-delete-user: request received (POST)`);
    // Keep default Supabase secret names first, then support project-specific EP_* aliases.
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("EP_SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("EP_SUPABASE_ANON_KEY");
    const serviceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("EP_SUPABASE_SERVICE_ROLE_KEY");
    const authHeader = req.headers.get("Authorization");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.log(`[${traceId}] admin-delete-user: auth validation failure (missing server env)`);
      return errorResponse(traceId, "env_validation", "Server env is missing.", 500);
    }

    if (!authHeader) {
      console.log(`[${traceId}] admin-delete-user: auth validation failure (missing auth header)`);
      return errorResponse(traceId, "auth_validation", "Missing auth header.", 401);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const {
      data: { user: actorAuthUser },
      error: actorAuthError,
    } = await userClient.auth.getUser();

    if (actorAuthError || !actorAuthUser?.email) {
      console.log(`[${traceId}] admin-delete-user: auth validation failure (unauthorized user)`);
      return errorResponse(traceId, "auth_validation", "Unauthorized user.", 401);
    }
    console.log(`[${traceId}] admin-delete-user: auth validation success`);

    const { data: actorProfile, error: actorProfileError } = await adminClient
      .from("users")
      .select("role, email")
      .ilike("email", actorAuthUser.email)
      .maybeSingle();

    if (actorProfileError) {
      console.log(`[${traceId}] admin-delete-user: auth validation failure (actor profile lookup failed)`);
      return errorResponse(traceId, "auth_validation", actorProfileError.message, 400);
    }

    if ((actorProfile?.role || "").toLowerCase() !== "admin") {
      console.log(`[${traceId}] admin-delete-user: auth validation failure (admin role required)`);
      return errorResponse(traceId, "auth_validation", "Forbidden. Admin access required.", 403);
    }

    const payload = (await req.json()) as DeleteRequest;
    const payloadTraceId = String(payload?.traceId || "").trim();
    const activeTraceId = payloadTraceId || traceId;
    const rawTargetUserId = payload?.targetUserId;
    const normalizedTargetUserId =
      rawTargetUserId === undefined || rawTargetUserId === null
        ? ""
        : String(rawTargetUserId).trim();
    const targetEmail = String(payload?.targetEmail ?? "").trim().toLowerCase();
    console.log(
      `[${activeTraceId}] admin-delete-user: payload received`,
      { targetUserId: normalizedTargetUserId || null, targetEmail: targetEmail || null },
    );

    if (!targetEmail) {
      return errorResponse(activeTraceId, "payload_validation", "Invalid target user payload. targetEmail is required.", 400);
    }

    if (targetEmail === actorAuthUser.email.toLowerCase()) {
      return errorResponse(activeTraceId, "payload_validation", "Admins cannot delete their own account here.", 400);
    }

    const { data: targetProfile, error: targetProfileError } = await adminClient
      .from("users")
      .select("id, email, name, role, status")
      .ilike("email", targetEmail)
      .maybeSingle();

    if (targetProfileError) {
      return errorResponse(activeTraceId, "db_lookup", targetProfileError.message, 400);
    }

    if (!targetProfile) {
      return errorResponse(activeTraceId, "db_lookup", "Target user not found.", 404);
    }

    if (normalizedTargetUserId && String(targetProfile.id) !== normalizedTargetUserId) {
      return new Response(
        JSON.stringify({
          success: false,
          traceId: activeTraceId,
          step: "payload_validation",
          message: "Target user mismatch between id and email.",
          error: "Target user mismatch between id and email.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: listedUsers, error: listUsersError } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (listUsersError) {
      return errorResponse(activeTraceId, "auth_lookup", `Auth lookup failed: ${listUsersError.message}`, 400);
    }

    const targetAuthUser = listedUsers.users.find(
      (u) => (u.email || "").toLowerCase() === targetEmail
    );

    if (!targetAuthUser?.id) {
      return errorResponse(activeTraceId, "auth_lookup", "Auth user not found; database delete was not attempted.", 404);
    }

    // Critical order guarantee:
    // 1) Delete auth identity first. If this fails, stop and keep DB row unchanged.
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(targetAuthUser.id);
    if (deleteAuthError) {
      console.log(`[${activeTraceId}] admin-delete-user: auth delete failure`);
      return errorResponse(activeTraceId, "auth_delete", `Auth deletion failed: ${deleteAuthError.message}`, 400);
    }
    console.log(`[${activeTraceId}] admin-delete-user: auth delete success`);

    // 2) Delete DB row second.
    const { error: deleteRowError } = await adminClient
      .from("users")
      .delete()
      .eq("id", targetProfile.id)
      .ilike("email", targetEmail);

    if (deleteRowError) {
      console.log(`[${activeTraceId}] admin-delete-user: db delete failure`);
      // Compensating action: write a high-signal audit entry with enough metadata for manual recovery.
      const numericTargetUserId = Number.parseInt(String(targetProfile.id), 10);
      await adminClient.from("audit_logs").insert([
        {
          action_type: "critical_admin_delete_inconsistent_state",
          actor_email: actorAuthUser.email,
          target_user_id: Number.isNaN(numericTargetUserId) ? null : numericTargetUserId,
          meta: {
            reason: "auth_deleted_but_db_delete_failed",
            target_email: targetEmail,
            auth_user_id: targetAuthUser.id,
            db_error_message: deleteRowError.message,
            snapshot_before_delete: targetProfile,
          },
        },
      ]);

      return new Response(
        JSON.stringify({
          success: false,
          traceId: activeTraceId,
          step: "db_delete",
          message:
            "Auth user deleted, but database delete failed. Incident logged for manual recovery.",
          error:
            "Auth user deleted, but database delete failed. Incident logged for manual recovery.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    console.log(`[${activeTraceId}] admin-delete-user: db delete success`);
    console.log(`[${activeTraceId}] admin-delete-user: function end`);

    return new Response(
      JSON.stringify({
        success: true,
        traceId: activeTraceId,
        message: "User deleted from auth and database.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.log(`[${traceId}] admin-delete-user: function error`);
    return errorResponse(traceId, "unknown", error instanceof Error ? error.message : "Unknown error", 500);
  }
});
