/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/supabase";
import ThemeToggleButton from "../../components/UI/ThemeToggleButton";

function VerifyEmail() {
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
  SECTION: EMAIL RESEND API
  ========================
  */
  const handleResendVerification = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (!email.trim()) {
      setIsError(true);
      setMessage("Please enter your email.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
    });
    setLoading(false);

    if (error) {
      setIsError(true);
      setMessage(error.message);
    } else {
      setMessage("Verification email resent successfully!");
    }
  };

  /*
  ========================
  SECTION: VERIFY EMAIL UI
  ========================
  */
  return (
    <div className="min-h-screen bg-[#fff1f7] dark:bg-[#0f172a] flex items-center justify-center p-4 transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="absolute top-5 right-5">
        <ThemeToggleButton />
      </div>

      {/* Main Container */}
      <main className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] border border-[#7C3AED]/30 shadow-xl p-8 relative overflow-hidden">
        
        {/* Top Decorative Aura */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#7C3AED]/10 rounded-full blur-3xl"></div>

        {/* Header Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-[#7C3AED]/5 rounded-full flex items-center justify-center mb-4 relative">
             {/* Mail Icon */}
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 6L12 13L2 6" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="absolute top-0 right-0 w-4 h-4 bg-[#7C3AED] rounded-full animate-ping"></div>
          </div>
          
          <h2 className="text-2xl font-bold text-[#1d1b20] dark:text-white text-center">Verify Email</h2>
          <p className="text-gray-400 text-[11px] text-center mt-2 px-2 leading-relaxed">
            Almost there! Please check your inbox and click the verification link.
          </p>
        </div>

        <form onSubmit={handleResendVerification} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1">
              Your Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              className="w-full h-12 px-5 rounded-xl bg-[#7C3AED]/5 dark:bg-slate-800 border border-transparent focus:border-[#7C3AED] focus:bg-white dark:focus:bg-slate-800 focus:outline-none dark:text-white transition-all text-sm"
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full h-14 bg-[#7C3AED] text-white font-bold rounded-xl shadow-lg shadow-[#7C3AED]/20 active:scale-95 transition-all flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : "Resend Verification"}
          </button>

          {message && (
            <div className={`p-4 rounded-xl text-center text-[11px] font-semibold border animate-fade-in ${
              isError 
                ? "bg-red-50 text-red-500 border-red-100 dark:bg-red-900/10 dark:border-red-900/20" 
                : "bg-green-50 text-green-600 border-green-100 dark:bg-green-900/10 dark:border-green-900/20"
            }`}>
              {message}
            </div>
          )}
        </form>

        {/* Back to Login Footer */}
        <div className="mt-8 text-center border-t dark:border-slate-800 pt-6">
          <Link to="/login" className="inline-flex items-center gap-2 text-[#7C3AED] font-bold text-xs hover:underline uppercase tracking-widest">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Login
          </Link>
        </div>
      </main>
    </div>
  );
}

export default VerifyEmail;

