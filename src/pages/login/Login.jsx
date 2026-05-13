/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import ThemeToggleButton from "../../components/UI/ThemeToggleButton";
import { toUserMessage, withRetry } from "../../services/api";
import useAuth from "../../hooks/useAuth";
import TypewriterText from "../../components/UI/TypewriterText";

function Login() {
  /*
  ========================
  SECTION: AUTH STATE
  ========================
  */
  const { user, role, loading: authLoading, setRegistrationJustCompleted } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /*
  ========================
  SECTION: FORM RESET LOGIC
  ========================
  */
  useEffect(() => {
    const resetForm = () => {
      setEmail("");
      setPassword("");
      setMessage("");
      setIsError(false);
    };
    resetForm();
    window.addEventListener("pageshow", resetForm);
    return () => window.removeEventListener("pageshow", resetForm);
  }, []);

  /*
  ========================
  SECTION: AUTH REDIRECT LOGIC
  ========================
  */
  if (!authLoading && user) {
    return <Navigate to={role === "admin" ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  /*
  ========================
  SECTION: LOGIN API FLOW
  ========================
  */
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setIsError(true);
      setMessage("Please enter email and password.");
      return;
    }

    setLoading(true);
    const { error } = await withRetry(
      async () =>
        supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        }),
      1
    );
    setLoading(false);

    if (error) {
      setIsError(true);
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setMessage("Email not verified. Please verify first.");
      } else if (error.message.toLowerCase().includes("invalid login credentials")) {
        setMessage("Email or password are wrong.");
      } else {
        setMessage(toUserMessage(error));
      }
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("status")
      .ilike("email", trimmedEmail)
      .maybeSingle();

    if (profileError) {
      setIsError(true);
      setMessage(toUserMessage(profileError));
      await supabase.auth.signOut();
      return;
    }

    if ((profile?.status || "active").toLowerCase() === "inactive") {
      setIsError(true);
      setMessage("Your account is inactive. Please contact admin.");
      await supabase.auth.signOut();
      return;
    }

    setEmail("");
    setPassword("");
    setIsError(false);
    setMessage("Login successful.");
    setRegistrationJustCompleted(false);
    navigate("/dashboard");
  };

  /*
  ========================
  SECTION: LOGIN UI
  ========================
  */
  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] flex items-center justify-center p-4 transition-colors duration-300">
      <div className="absolute top-5 right-5">
        <ThemeToggleButton />
      </div>

      <main className="w-full max-w-sm bg-[#EDE9FE] dark:bg-slate-900 rounded-[2rem] border border-[#7C3AED]/40 shadow-xl p-8 relative text-[#5B21B6] dark:text-white">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 flex items-center justify-center mb-2">
            <svg width="45" height="45" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#7C3AED" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#5B21B6] dark:text-white">
            <TypewriterText text="Welcome Back!" />
          </h2>
          <p className="text-[#5B21B6]/70 text-[10px] uppercase tracking-widest mt-1">Login to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-3">
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-12 px-5 rounded-xl bg-white dark:bg-slate-800 border border-[#7C3AED]/40 focus:border-[#7C3AED] focus:outline-none text-[#5B21B6] dark:text-white transition-all text-sm" autoComplete="off" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-12 px-5 rounded-xl bg-white dark:bg-slate-800 border border-[#7C3AED]/40 focus:border-[#7C3AED] focus:outline-none text-[#5B21B6] dark:text-white transition-all text-sm" autoComplete="current-password" />
          </div>

          <div className="flex items-center justify-between px-1">
            <Link to="/forgot-password" className="text-[11px] text-[#7C3AED] font-bold hover:underline">Forgot password?</Link>
            <Link to="/verify-email" className="text-[11px] text-[#5B21B6]/70 hover:text-[#7C3AED] transition-colors">Verify email</Link>
          </div>

          <button disabled={loading} type="submit" className="w-full h-14 bg-[#7C3AED] text-white font-bold rounded-xl shadow-lg shadow-[#7C3AED]/20 hover:bg-[#EDE9FE] hover:text-[#7C3AED] active:scale-95 transition-all mt-2 flex items-center justify-center border border-[#7C3AED]/40">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Sign In"}
          </button>

          {message && <p className={`text-center text-[11px] font-medium mt-2 ${isError ? "text-red-500" : "text-green-500"}`}>{message}</p>}
        </form>

        <div className="mt-8 text-center border-t border-[#7C3AED]/30 dark:border-slate-800 pt-6">
          <p className="text-[#5B21B6]/70 text-[11px] mb-2 font-medium">New to Aura?</p>
          <Link to="/register" className="block w-full py-3 rounded-xl border border-[#7C3AED]/30 text-[#7C3AED] font-bold text-xs hover:bg-[#7C3AED]/5 transition-all uppercase tracking-wider">Register Here</Link>
        </div>
      </main>
    </div>
  );
}

export default Login;

