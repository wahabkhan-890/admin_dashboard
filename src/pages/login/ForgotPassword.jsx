/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/supabase";
import ThemeToggleButton from "../../components/UI/ThemeToggleButton";
import { toUserMessage } from "../../services/api";

function ForgotPassword() {
  /*
  ========================
  SECTION: FORM STATE
  ========================
  */
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  /*
  ========================
  SECTION: RECOVERY API LOGIC
  ========================
  */
  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setIsError(true);
      setMessage("Please enter your email address.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      setIsError(true);
      setMessage(toUserMessage(error));
    } else {
      setIsError(false);
      setMessage("Recovery link sent! Check your inbox.");
      setEmail("");
    }
  };

  /*
  ========================
  SECTION: FORGOT PASSWORD UI
  ========================
  */
  return (
    <div className="min-h-screen bg-[#fff1f7] dark:bg-[#0f172a] flex items-center justify-center p-4 transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="absolute top-5 right-5">
        <ThemeToggleButton />
      </div>

      {/* Main Professional Container */}
      <main className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] border border-[#7C3AED]/30 shadow-xl p-8 relative overflow-hidden">
        
        {/* Background Aura Decorative */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#7C3AED]/5 rounded-full blur-3xl"></div>

        {/* Logo & Header Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#7C3AED]/10 rounded-2xl flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6M22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6M22 6L12 13L2 6" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1d1b20] dark:text-white">Recover Access</h2>
          <p className="text-gray-400 text-[11px] text-center mt-2 px-4 leading-relaxed">
            Enter your email and we'll send you a secure link to reset your password.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-5 rounded-xl bg-[#7C3AED]/5 dark:bg-slate-800 border border-transparent focus:border-[#7C3AED] focus:bg-white dark:focus:bg-slate-800 focus:outline-none dark:text-white transition-all text-sm"
              autoComplete="email"
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full h-14 bg-[#7C3AED] text-white font-bold rounded-xl shadow-lg shadow-[#7C3AED]/20 active:scale-95 transition-all flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : "Send Recovery Link"}
          </button>

          {/* Feedback Section */}
          {message && (
            <div className={`p-4 rounded-xl text-center text-[11px] font-semibold border ${
              isError 
                ? "bg-red-50 text-red-500 border-red-100 dark:bg-red-900/10 dark:border-red-900/20" 
                : "bg-green-50 text-green-600 border-green-100 dark:bg-green-900/10 dark:border-green-900/20"
            }`}>
              {message}
            </div>
          )}
        </form>

        {/* Footer Navigation */}
        <div className="mt-8 text-center border-t dark:border-slate-800 pt-6">
          <Link to="/login" className="flex items-center justify-center gap-2 text-[#7C3AED] font-bold text-xs hover:underline uppercase tracking-wider">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Login
          </Link>
        </div>
      </main>
    </div>
  );
}

export default ForgotPassword;

