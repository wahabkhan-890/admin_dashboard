/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Spinner from "../components/UI/Spinner";

function AdminRoute({ children }) {
  const { user, role, status, loading } = useAuth();

  // Prevent premature redirects while auth state is still loading.
  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Spinner className="w-6 h-6" color="text-indigo-500" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (status === "inactive") return <Navigate to="/login" replace />;

  if (role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AdminRoute;

