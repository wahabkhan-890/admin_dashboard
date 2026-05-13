/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import LogoutButton from "../../components/Layout/LogoutButton";
import useAuth from "../../hooks/useAuth";
import { useEffect } from "react";              // 🔥 NEW
import { useNavigate } from "react-router-dom"; // 🔥 NEW

function Dashboard() {
  const { user, role } = useAuth();
  const navigate = useNavigate();               // 🔥 NEW

  console.log("user:", user);
  console.log("role:", role);

  // 🔥 NEW: role based redirect (SAFE)
  useEffect(() => {
    if (role === "admin") {
      navigate("/admin/dashboard");
    }
  }, [role, navigate]); // dependency safe rakhi

  return (
    <div>
      <h1>Welcome to Dashboard</h1>

      <p>Hello {user?.email}</p>
      <p>{user ? "User Present" : "No User"}</p>
      <p>Role: {role || "No Role"}</p>

      {/* 🔥 existing UI safe */}
      {role === "admin" && (
        <p style={{ color: "red" }}>Admin Access Granted</p>
      )}

      <LogoutButton />
    </div>
  );
}

export default Dashboard;

