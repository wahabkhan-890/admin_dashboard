/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Spinner from "../components/UI/Spinner";

function ProtectedRoute({ children, allowedRole }) {
  const { user, role, status, loading } = useAuth();

  // Wait until Supabase auth/session is resolved before any redirect decision.
  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Spinner className="w-6 h-6" color="text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (status === "inactive") {
    return <Navigate to="/login" replace />;
  }

  // Role check must run only after auth has resolved.
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;

