/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import Card from "../../components/UI/Card";
import Table from "../../components/UI/Table";
import Badge from "../../components/UI/Badge";
import { toUserMessage } from "../../services/api";
import useToast from "../../hooks/useToast";
import Button from "../../components/UI/Button";

function AuditLogs() {
  /*
  ========================
  SECTION: AUDIT LOG STATE
  ========================
  */
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");

  /*
  ========================
  SECTION: AUDIT FETCH API
  ========================
  */
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data, error: apiError } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setLoading(false);
    if (apiError) {
      const message = toUserMessage(apiError);
      setError(message);
      showToast(`Failed to load audit logs: ${message}`, "error");
      return;
    }
    setLogs(data || []);
  }, [showToast]);

  /*
  ========================
  SECTION: INITIAL LOAD LOGIC
  ========================
  */
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  /*
  ========================
  SECTION: AUDIT CLEAR API
  ========================
  */
  const clearLogs = async () => {
    const shouldClear = window.confirm("Are you sure you want to clear all audit logs?");
    if (!shouldClear) return;
    if (logs.length === 0) return;

    setClearing(true);
    const logIds = logs.map((log) => log.id).filter(Boolean);
    const { data: deletedRows, error: deleteError } = await supabase
      .from("audit_logs")
      .delete()
      .in("id", logIds)
      .select("id");

    if (deleteError) {
      setClearing(false);
      const message = toUserMessage(deleteError);
      showToast(`Failed to clear audit logs: ${message}`, "error");
      return;
    }

    const deletedCount = deletedRows?.length || 0;
    await fetchLogs();
    setClearing(false);

    if (deletedCount === 0) {
      showToast("Clear failed: database delete permission is missing for audit logs.", "error");
      return;
    }

    showToast(`Audit logs cleared permanently (${deletedCount} removed).`, "success");
  };

  /*
  ========================
  SECTION: TABLE COLUMN MODEL
  ========================
  */
  const columns = [
    {
      header: "Action",
      render: (log) => {
        let variant = "neutral";
        if (log.action_type.includes("deleted")) variant = "danger";
        if (log.action_type.includes("updated")) variant = "primary";
        if (log.action_type.includes("success")) variant = "success";
        
        return <Badge variant={variant}>{log.action_type.toUpperCase().replace(/_/g, ' ')}</Badge>;
      }
    },
    {
      header: "Actor (Admin)",
      render: (log) => <span className="text-gray-900 dark:text-gray-200 font-medium">{log.actor_email || "System"}</span>
    },
    {
      header: "Target ID",
      accessor: "target_user_id",
      render: (log) => <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{log.target_user_id || "-"}</span>
    },
    {
      header: "Timestamp",
      render: (log) => (
        <span className="text-gray-500 dark:text-gray-400">
          {new Date(log.created_at).toLocaleString(undefined, { 
            year: 'numeric', month: 'short', day: 'numeric', 
            hour: '2-digit', minute:'2-digit' 
          })}
        </span>
      )
    }
  ];

  /*
  ========================
  SECTION: AUDIT LOGS UI
  ========================
  */
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Audit Logs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review system activity and administrative actions.</p>
        <div className="mt-3">
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={clearLogs}
            disabled={loading || clearing || logs.length === 0}
          >
            {clearing ? "Clearing..." : "Clear Logs"}
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center justify-between gap-3">
          <span>{error}</span>
          <Button type="button" size="sm" variant="secondary" onClick={fetchLogs}>
            Retry
          </Button>
        </div>
      )}

      <Card noPadding>
        <Table 
          columns={columns} 
          data={logs} 
          isLoading={loading} 
          emptyMessage="No recent audit logs found in the system."
        />
      </Card>
    </div>
  );
}

export default AuditLogs;


