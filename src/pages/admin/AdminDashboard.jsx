/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import useAuth from "../../hooks/useAuth";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import useToast from "../../hooks/useToast";
import Input from "../../components/UI/Input";
import Button from "../../components/UI/Button";
import Card from "../../components/UI/Card";
import Table from "../../components/UI/Table";
import Badge from "../../components/UI/Badge";
import { toUserMessage, withRetry } from "../../services/api";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/UI/Spinner";

function AdminDashboard() {
  /*
  ========================
  SECTION: ADMIN STATE
  ========================
  */
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    normal: 0,
    newToday: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const pageSize = 5;
  const createTraceId = () => `DEL-${Math.floor(100000 + Math.random() * 900000)}`;

  /*
  ========================
  SECTION: USERS LIST FETCH API
  ========================
  */
  const getUserData = useCallback(async () => {
    if (!navigator.onLine) {
      setIsOffline(true);
      setErrorMessage("You are offline. Please check your internet connection.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      let query = supabase
        .from("users")
        .select("*", { count: "exact" })
        .order("id", { ascending: true });

      if (search.trim()) {
        query = query.ilike("email", `%${search.trim()}%`);
      }
      if (roleFilter !== "all") {
        query = query.eq("role", roleFilter);
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      query = query.range((page - 1) * pageSize, page * pageSize - 1);
      const { data, error, count } = await withRetry(async () => query, 1);

      if (error) {
        setErrorMessage(toUserMessage(error, "Failed to fetch users."));
        showToast(`Failed to fetch users: ${toUserMessage(error)}`, "error");
        return;
      }

      setUsers(data || []);
      setTotalUsers(count ?? 0);
    } catch {
      const offline = !navigator.onLine;
      setIsOffline(offline);
      setErrorMessage(
        offline
          ? "You are offline. Please check your internet connection."
          : "Something went wrong while fetching users."
      );
      showToast(
        offline ? "You are offline. Please check your internet connection." : "Unexpected fetch error.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, search, statusFilter, showToast]);

  /*
  ========================
  SECTION: ADMIN STATS FETCH API
  ========================
  */
  const getUserStats = useCallback(async () => {
    if (!navigator.onLine) {
      setIsOffline(true);
      setStatsError("You are offline. Please check your internet connection.");
      setStatsLoading(false);
      return;
    }

    setStatsLoading(true);
    setStatsError("");
    try {
      const { data, error } = await withRetry(
        () =>
          supabase
            .from("users")
            .select("role, status, created_at"),
        1
      );

      if (error) {
        setStatsError(toUserMessage(error, "Failed to load dashboard stats."));
        showToast(`Failed to fetch stats: ${toUserMessage(error)}`, "error");
        return;
      }

      const rows = data || [];
      const today = new Date();
      const todayDateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const nextStats = rows.reduce(
        (acc, row) => {
          const role = String(row.role || "").toLowerCase();
          const normalizedStatus = String(row.status || "").toLowerCase();
          const createdDateKey = row.created_at
            ? new Date(row.created_at).toISOString().slice(0, 10)
            : "";

          acc.total += 1;
          if (normalizedStatus === "active") acc.active += 1;
          if (normalizedStatus === "inactive") acc.inactive += 1;
          if (role === "admin") acc.admins += 1;
          if (role === "user") acc.normal += 1;
          if (createdDateKey === todayDateKey) acc.newToday += 1;
          return acc;
        },
        { total: 0, active: 0, inactive: 0, admins: 0, normal: 0, newToday: 0 }
      );

      setStats(nextStats);
    } catch {
      const offline = !navigator.onLine;
      setIsOffline(offline);
      setStatsError(
        offline
          ? "You are offline. Please check your internet connection."
          : "Something went wrong while fetching dashboard stats."
      );
      showToast(
        offline ? "You are offline. Please check your internet connection." : "Unexpected stats fetch error.",
        "error"
      );
    } finally {
      setStatsLoading(false);
    }
  }, [showToast]);

  /*
  ========================
  SECTION: INITIAL LOAD LOGIC
  ========================
  */
  useEffect(() => {
    const timer = setTimeout(() => {
      getUserData();
      getUserStats();
    }, 0);
    return () => clearTimeout(timer);
  }, [getUserData, getUserStats]);

  /*
  ========================
  SECTION: NETWORK EVENT HANDLERS
  ========================
  */
  useEffect(() => {
    const onOffline = () => {
      setIsOffline(true);
      setErrorMessage("You are offline. Please check your internet connection.");
      setStatsError("You are offline. Please check your internet connection.");
    };
    const onOnline = () => {
      setIsOffline(false);
      getUserData();
      getUserStats();
    };

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);

    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [getUserData, getUserStats]);

  /*
  ========================
  SECTION: AUDIT LOG WRITER
  ========================
  */
  const logAdminAction = async (actionType, targetUserId, meta = {}) => {
    const parsedTargetId = Number.parseInt(String(targetUserId), 10);
    const normalizedTargetId = Number.isNaN(parsedTargetId) ? null : parsedTargetId;

    const payload = {
      action_type: actionType,
      actor_email: user?.email || null,
      target_user_id: normalizedTargetId,
      meta: { ...meta, raw_target_user_id: String(targetUserId) },
    };

    const { error } = await supabase.from("audit_logs").insert([payload]);
    if (error && import.meta.env.DEV) {
      console.warn("Audit log insert failed:", error.message);
    }
  };

  /*
  ========================
  SECTION: DELETE USER FLOW
  ========================
  */
  const handleDeleteUser = async (targetUser) => {
    const targetUserId = targetUser?.id;
    const targetEmail = targetUser?.email;
    if (!targetUserId || !targetEmail) {
      showToast("Delete failed: target user data is incomplete.", "error");
      return;
    }

    const traceId = createTraceId();
    setProcessingId(targetUserId);
    try {
      const isSelfDelete = String(targetEmail || "").toLowerCase() === String(user?.email || "").toLowerCase();
      if (isSelfDelete) {
        console.log("[delete-account] request sent (self-delete from admin dashboard)", { traceId, targetUserId, targetEmail });
        const { data, error } = await supabase.functions.invoke("delete-account", {
          method: "POST",
          body: { traceId },
        });
        console.log("[delete-account] response received (self-delete from admin dashboard)", {
          traceId,
          success: data?.success ?? null,
          step: data?.step ?? null,
        });

        if (error) {
          console.log("[delete-account] error received (self-delete from admin dashboard)", { traceId, message: error.message });
          let detailedMessage = toUserMessage(error);
          try {
            const contextJson = await error.context?.json?.();
            if (contextJson?.message || contextJson?.error) {
              detailedMessage = contextJson.message || contextJson.error;
            }
          } catch {
            // Keep fallback message.
          }
          showToast(`Account delete failed: ${detailedMessage} (Trace: ${traceId})`, "error");
          return;
        }

        if (!data?.success) {
          showToast(`Account delete failed: ${data?.message || data?.error || "Unknown delete error."} (Trace: ${traceId})`, "error");
          return;
        }

        const { error: authError } = await supabase.auth.signOut();
        if (authError) {
          showToast(`Signout failed: ${toUserMessage(authError)}`, "error");
          return;
        }

        sessionStorage.setItem("recent_account_delete_at", String(Date.now()));
        showToast("Account deleted successfully.", "success");
        navigate("/register");
        return;
      }

      console.log("[admin-delete-user] request sent", { traceId, targetUserId, targetEmail });
      const { data, error } = await supabase.functions.invoke("admin-delete-user", {
        method: "POST",
        body: { targetUserId, targetEmail, traceId },
      });
      console.log("[admin-delete-user] response received", {
        traceId,
        success: data?.success ?? null,
        step: data?.step ?? null,
      });

      if (error) {
        console.log("[admin-delete-user] error received", { traceId, message: error.message });
        let detailedMessage = toUserMessage(error);
        try {
          const contextJson = await error.context?.json?.();
          if (contextJson?.message || contextJson?.error) {
            detailedMessage = contextJson.message || contextJson.error;
          }
        } catch {
          // Keep fallback message.
        }
        showToast(`Delete failed: ${detailedMessage} (Trace: ${traceId})`, "error");
        return;
      }

      if (!data?.success) {
        showToast(`Delete failed: ${data?.message || data?.error || "Unknown delete error."} (Trace: ${traceId})`, "error");
        return;
      }

      setUsers((prev) => prev.filter((u) => u.id !== targetUserId));
      setTotalUsers((prev) => Math.max(0, prev - 1));
      showToast("User deleted successfully.", "success");
      await logAdminAction("user_deleted", targetUserId, {
        email: targetEmail,
        auth_deleted: true,
      });
    } catch (err) {
      console.log("[admin-delete-user] error received", {
        traceId,
        message: err instanceof Error ? err.message : "Unknown invoke error",
      });
      showToast(`Unexpected delete error. (Trace: ${traceId})`, "error");
    } finally {
      setProcessingId(null);
    }
  };

  /*
  ========================
  SECTION: ROLE UPDATE FLOW
  ========================
  */
  const handleUpdatedUser = async (userId, newRole, newName) => {
    setProcessingId(userId);
    try {
      const { data, error } = await supabase
        .from("users")
        .update({ role: newRole, name: newName })
        .select("id, role, name")
        .eq("id", userId);

      if (error) {
        showToast(`Update failed: ${toUserMessage(error)}`, "error");
        return;
      }

      if (!data || data.length === 0) {
        showToast("Update blocked by permission or invalid target.", "error");
        return;
      }

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId ? { ...u, role: newRole, name: newName } : u
        )
      );
      showToast("User updated successfully.", "success");
      await logAdminAction("user_role_updated", userId, { role: newRole });
    } catch {
      showToast("Unexpected update error.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  /*
  ========================
  SECTION: STATUS TOGGLE FLOW
  ========================
  */
  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "inactive" ? "active" : "inactive";
    setProcessingId(userId);
    try {
      const { data, error } = await supabase
        .from("users")
        .update({ status: newStatus })
        .select("id, status")
        .eq("id", userId);

      if (error) {
        showToast(`Status update failed: ${toUserMessage(error)}`, "error");
        return;
      }

      if (!data || data.length === 0) {
        showToast("Status update blocked by permission or invalid target.", "error");
        return;
      }

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId ? { ...u, status: newStatus } : u
        )
      );
      showToast(`User ${newStatus === "inactive" ? "deactivated" : "activated"} successfully.`, "success");
      await logAdminAction("user_status_updated", userId, { status: newStatus });
    } catch {
      showToast("Unexpected status update error.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));

  /*
  ========================
  SECTION: TABLE CONFIG MODEL
  ========================
  */
  const columns = [
    {
      header: "User Details",
      render: (u) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{u.name || "N/A"}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
        </div>
      )
    },
    {
      header: "Role",
      render: (u) => (
        <Badge variant={u.role === "admin" ? "primary" : "neutral"}>
          {u.role.toUpperCase()}
        </Badge>
      )
    },
    {
      header: "Status",
      render: (u) => (
        <Badge variant={(u.status || "active") === "inactive" ? "danger" : "success"}>
          {(u.status || "active").toUpperCase()}
        </Badge>
      )
    },
    {
      header: "Actions",
      render: (u) => (
        <div className="flex gap-2">
          {u.role !== 'admin' && (
            <Button
              size="sm"
              variant="secondary"
              className="border border-[#7C3AED]/30 text-[#5B21B6] dark:text-white"
              loading={processingId === u.id}
              onClick={(e) => { e.stopPropagation(); handleUpdatedUser(u.id, "admin", u.name); }}
            >
              Make Admin
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            className="border border-[#7C3AED]/30 text-[#5B21B6] dark:text-white"
            loading={processingId === u.id}
            onClick={(e) => { e.stopPropagation(); handleToggleStatus(u.id, (u.status || "active")); }}
          >
            {(u.status || "active") === "inactive" ? "Activate" : "Deactivate"}
          </Button>
            <Button
              size="sm"
              variant="secondary"
              className="border border-[#7C3AED]/30 text-[#5B21B6] dark:text-white"
              loading={processingId === u.id}
              onClick={(e) => { e.stopPropagation(); handleDeleteUser(u); }}
            >
              Delete
            </Button>
          </div>
      )
    }
  ];

  /*
  ========================
  SECTION: STATS CARD MODEL
  ========================
  */
  const statCards = [
    { label: "Total Users", value: stats.total },
    { label: "Active Users", value: stats.active },
    { label: "Inactive Users", value: stats.inactive },
    { label: "Admin Users", value: stats.admins },
    { label: "Normal Users", value: stats.normal },
    { label: "New Today", value: stats.newToday },
  ];
  const hasStatsData = Object.values(stats).some((value) => value > 0);

  /*
  ========================
  SECTION: ADMIN DASHBOARD UI
  ========================
  */
  return (
    <div className="space-y-8 rounded-3xl p-4 sm:p-6 bg-gradient-to-b from-purple-50/55 via-purple-50/25 to-white dark:from-[#15161d] dark:via-[#12131a] dark:to-[#12131a] text-[#5B21B6] dark:text-white">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl border border-[#7C3AED]/25 bg-[#EDE9FE]/70 dark:bg-[#1e1f26]/70 p-6 shadow-[0_20px_40px_-24px_rgba(124,58,237,0.28)]">
        <div className="absolute -top-16 left-1/4 h-40 w-72 rounded-full bg-[#7C3AED]/15 blur-3xl"></div>
        <h1 className="relative text-3xl font-bold tracking-tight text-[#5B21B6] dark:text-white">System Overview</h1>
        <p className="relative mt-2 text-sm text-[#5B21B6]/80 dark:text-white/80">Manage your team members and their account permissions here.</p>
      </div>

      {statsError && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center justify-between gap-3">
          <span>{statsError}</span>
          <Button type="button" size="sm" variant="secondary" onClick={getUserStats}>
            Retry
          </Button>
        </div>
      )}

      {!statsLoading && !statsError && !hasStatsData && (
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 text-sm flex items-center justify-between gap-3">
          <span>No dashboard stats available yet.</span>
          <Button type="button" size="sm" variant="secondary" onClick={getUserStats}>
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {statCards.map((card) => (
          <Card key={card.label} className="relative overflow-hidden rounded-3xl border border-[#7C3AED]/25 bg-[#EDE9FE]/70 dark:bg-[#1e1f26]/70 shadow-[0_16px_36px_-24px_rgba(124,58,237,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#7C3AED]/40">
            <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/10 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100"></div>
            <p className="relative text-[11px] font-bold uppercase tracking-wider text-[#5B21B6]/75 dark:text-white/75">
              {card.label}
            </p>
            <p className="relative mt-2 text-3xl font-bold tracking-tight text-[#5B21B6] dark:text-white">
              {statsLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner className="w-5 h-5" color="text-[#7C3AED]" />
                  <span className="text-sm font-medium text-[#5B21B6]/75 dark:text-white/75">Loading</span>
                </span>
              ) : card.value}
            </p>
          </Card>
        ))}
      </div>

      <Card noPadding className="rounded-3xl border border-[#7C3AED]/25 bg-[#EDE9FE]/70 dark:bg-[#1e1f26]/70 shadow-[0_16px_36px_-24px_rgba(124,58,237,0.35)] overflow-x-auto">
        <div className="px-5 sm:px-6 py-4 flex items-center gap-3 whitespace-nowrap min-w-[860px]">
          <Input
            type="text"
            className="flex-1 min-w-[220px]"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search users..."
            icon={(props) => (
               <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            )}
          />
          <div className="w-44 shrink-0">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white dark:bg-[#1a1b22] text-[#5B21B6] dark:text-white border border-purple-200/70 dark:border-[#574146]/50 outline-none rounded-xl px-3 py-2.5 transition-all focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/20"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="user">Standard Users</option>
            </select>
          </div>
          <div className="w-44 shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white dark:bg-[#1a1b22] text-[#5B21B6] dark:text-white border border-purple-200/70 dark:border-[#574146]/50 outline-none rounded-xl px-3 py-2.5 transition-all focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/20"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <Button
            onClick={() => {
              getUserData();
              getUserStats();
            }}
            disabled={loading || statsLoading}
            variant="secondary"
            className="ml-auto shrink-0 text-[#5B21B6] dark:text-white border border-[#7C3AED]/30"
          >
            Refresh
          </Button>
        </div>
      </Card>

      {isOffline && (
        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm">
          You are offline. Please check your internet connection.
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center justify-between gap-3">
          <span>{errorMessage}</span>
          <Button type="button" size="sm" variant="secondary" onClick={getUserData}>
            Retry
          </Button>
        </div>
      )}

      {/* Table Section */}
      <Card noPadding className="rounded-3xl border border-[#7C3AED]/25 bg-[#EDE9FE]/70 dark:bg-[#1e1f26]/70 shadow-[0_16px_36px_-24px_rgba(124,58,237,0.35)] overflow-hidden">
        <Table 
          columns={columns} 
          data={users} 
          isLoading={loading} 
          emptyMessage="No users found matching your criteria." 
          onEmptyAction={getUserData}
          emptyActionLabel="Reload Users"
        />
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-purple-200/70 dark:border-[#574146]/45 flex items-center justify-between">
          <p className="text-sm text-[#5B21B6]/80 dark:text-white/80 hidden sm:block">
            Showing <span className="font-medium text-[#5B21B6] dark:text-white">{(page - 1) * pageSize + 1}</span> to <span className="font-medium text-[#5B21B6] dark:text-white">{Math.min(page * pageSize, totalUsers)}</span> of <span className="font-medium text-[#5B21B6] dark:text-white">{totalUsers}</span> results
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <Button variant="ghost" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
               Prv
            </Button>
            <div className="text-sm text-[#5B21B6] dark:text-white sm:hidden">Page {page} / {totalPages}</div>
            <Button variant="ghost" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>
               Next
            </Button>
          </div>
        </div>
      </Card>
      
    </div>
  );
}

export default AdminDashboard;

