/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Spinner from "../components/UI/Spinner";

function PublicRoute({ children }) {
  const { user, role, loading } = useAuth();
  const [now, setNow] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNow(Date.now());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Spinner className="w-6 h-6" color="text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    const deletedAtRaw = sessionStorage.getItem("recent_account_delete_at");
    const deletedAt = Number.parseInt(deletedAtRaw || "", 10);
    const fiveMinutesMs = 5 * 60 * 1000;
    if (Number.isFinite(deletedAt) && now > 0 && now - deletedAt < fiveMinutesMs) {
      return <Navigate to="/register" replace />;
    }
    if (Number.isFinite(deletedAt) && now > 0 && now - deletedAt >= fiveMinutesMs) {
      sessionStorage.removeItem("recent_account_delete_at");
    }
  }

  if (user) {
    return <Navigate to={role === "admin" ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  return children;
}

export default PublicRoute;

