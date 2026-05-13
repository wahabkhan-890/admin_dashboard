/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import { useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggleButton from "../../components/UI/ThemeToggleButton";
import { supabase } from "../../services/supabase";
import { toUserMessage } from "../../services/api";

function ResetPassword() {
  /*
  ========================
  SECTION: FORM STATE
  ========================
  */
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /*
  ========================
  SECTION: PASSWORD UPDATE API
  ========================
  */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    setLoading(true);
    const { error: apiError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (apiError) {
      setError(toUserMessage(apiError));
      return;
    }
    setMessage("Password updated. You can login now.");
    setPassword("");
  };

  /*
  ========================
  SECTION: RESET PASSWORD UI
  ========================
  */
  return (
    <div className="min-h-screen bg-[#f8f7ff] dark:bg-[#0f172a] flex items-center justify-center p-4 transition-colors duration-300">
      <div className="absolute top-5 right-5">
        <ThemeToggleButton />
      </div>

      <main className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] border border-[#7C3AED]/30 shadow-xl p-8 relative overflow-hidden">
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#7C3AED]/5 rounded-full blur-2xl"></div>

        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-[#7C3AED]/10 rounded-full flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7V12C3 17.55 6.84 22.74 12 24C17.16 22.74 21 17.55 21 12V7L12 2Z" fill="#7C3AED" fillOpacity="0.2" stroke="#7C3AED" strokeWidth="2"/>
              <path d="M9 12L11 14L15 10" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1d1b20] dark:text-white text-center">New Password</h2>
          <p className="text-gray-400 text-[10px] uppercase tracking-widest mt-1">Update your credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1">
              Set New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="��������"
              className="w-full h-12 px-5 rounded-xl bg-[#7C3AED]/5 dark:bg-slate-800 border border-transparent focus:border-[#7C3AED] focus:bg-white dark:focus:bg-slate-800 focus:outline-none dark:text-white transition-all text-sm"
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full h-14 bg-[#7C3AED] text-white font-bold rounded-xl shadow-lg shadow-[#7C3AED]/20 hover:bg-[#EDE9FE] hover:text-[#7C3AED] active:scale-95 transition-all mt-2 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : "Update Password"}
          </button>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-500 text-center text-[11px] font-medium border border-red-100 dark:border-red-900/20">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10 text-green-600 text-center text-[11px] font-medium border border-green-100 dark:border-green-900/20">
              {message}
            </div>
          )}
        </form>

        <div className="mt-8 text-center border-t dark:border-slate-800 pt-6">
          <Link to="/login" className="text-[#7C3AED] font-bold text-xs hover:underline uppercase tracking-wider">
            Return to Login
          </Link>
        </div>
      </main>
    </div>
  );
}

export default ResetPassword;

