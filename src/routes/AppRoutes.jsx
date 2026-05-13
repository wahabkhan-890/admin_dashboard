/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/login/Login";
import Register from "../pages/register/Register";

import UserDashboard from "../pages/user/UserDashboard";
import Settings from "../pages/user/Settings";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AuditLogs from "../pages/admin/AuditLogs";
import ForgotPassword from "../pages/login/ForgotPassword";
import ResetPassword from "../pages/login/ResetPassword";
import VerifyEmail from "../pages/login/VerifyEmail";
import AppLayout from "../components/Layout/AppLayout";

import AdminRoute from "./AdminRoute";
import UserRoute from "./UserRoute";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/dashgoard" element={<Navigate to="/dashboard" replace />} />
      <Route path="/admin/dashgoard" element={<Navigate to="/admin/dashboard" replace />} />

      {/* 🔥 USER ROUTE */}
      <Route
        path="/dashboard"
        element={
          <UserRoute>
            <AppLayout title="User Dashboard">
              <UserDashboard />
            </AppLayout>
          </UserRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppLayout title="Settings">
              <Settings />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* 🔥 ADMIN ROUTE */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AppLayout title="Admin Dashboard">
              <AdminDashboard />
            </AppLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <AdminRoute>
            <AppLayout title="Audit Logs">
              <AuditLogs />
            </AppLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <AppLayout title="Admin Settings">
              <Settings />
            </AppLayout>
          </AdminRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;

