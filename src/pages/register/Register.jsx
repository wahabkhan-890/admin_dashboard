/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../services/supabase";
import { Link, useNavigate } from "react-router-dom";
import { toUserMessage } from "../../services/api";
import ThemeToggleButton from "../../components/UI/ThemeToggleButton";
import useAuth from "../../hooks/useAuth";
import TypewriterText from "../../components/UI/TypewriterText";

function Register() {
  /*
  ========================
  SECTION: FORM STATE
  ========================
  */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, setRedirectingToLogin] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { setRegistrationJustCompleted } = useAuth();

  /*
  ========================
  SECTION: PAGE RESET LOGIC
  ========================
  */
  useEffect(() => {
    const resetForm = () => {
      setName("");
      setEmail("");
      setPassword("");
      setAvatarPreview("");
      setMessage("");
      setIsError(false);
    };
    resetForm();
    window.addEventListener("pageshow", resetForm);
    return () => window.removeEventListener("pageshow", resetForm);
  }, []);

  /*
  ========================
  SECTION: AVATAR MEMORY CLEANUP
  ========================
  */
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  /*
  ========================
  SECTION: AVATAR INPUT VALIDATION
  ========================
  */
  const onAvatarPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setIsError(true);
      setMessage("Only JPG and PNG allowed.");
      return;
    }
    setIsError(false);
    setMessage("");
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(URL.createObjectURL(file));
  };

  /*
  ========================
  SECTION: REGISTER API FLOW
  ========================
  */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setIsError(true);
      setMessage("Please fill all fields.");
      return;
    }

    setLoading(true);
    setRegistrationJustCompleted(true);
    const { error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
    });

    if (error) {
      setRegistrationJustCompleted(false);
      setIsError(true);
      setMessage(toUserMessage(error));
      setLoading(false);
      return;
    }

    const { error: dbError } = await supabase.from("users").insert([
      { name: trimmedName, email: trimmedEmail, role: "user", avatar_url: "" },
    ]);

    if (dbError) {
      setRegistrationJustCompleted(false);
      setIsError(true);
      setMessage(toUserMessage(dbError));
      setLoading(false);
      return;
    }

    setRedirectingToLogin(true);
    navigate("/login", {
      replace: true,
      state: { message: "Registration successful! Please log in." },
    });
  };

  /*
  ========================
  SECTION: REGISTER UI
  ========================
  */
  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] flex items-center justify-center p-4 transition-colors duration-300">
      <div className="absolute top-5 right-5">
        <ThemeToggleButton />
      </div>

      <main className="w-full max-w-sm bg-[#EDE9FE] dark:bg-slate-900 rounded-[2rem] border border-[#7C3AED]/40 shadow-xl p-7 relative text-[#5B21B6] dark:text-white">
        <div className="flex flex-col items-center mb-4">
          <div className="w-12 h-12 flex items-center justify-center mb-2">
            <svg width="45" height="45" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#7C3AED" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#5B21B6] dark:text-white">
            <TypewriterText text="Create Account" />
          </h2>
          <p className="text-[#5B21B6]/70 text-[10px] uppercase tracking-widest">Create Account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-800 border border-[#7C3AED]/40 focus:border-[#7C3AED] focus:outline-none text-[#5B21B6] dark:text-white transition-all text-sm" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-800 border border-[#7C3AED]/40 focus:border-[#7C3AED] focus:outline-none text-[#5B21B6] dark:text-white transition-all text-sm" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-800 border border-[#7C3AED]/40 focus:border-[#7C3AED] focus:outline-none text-[#5B21B6] dark:text-white transition-all text-sm" />
          </div>

          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/80 dark:bg-slate-800/50 border border-dashed border-[#7C3AED]/30">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 bg-white dark:bg-slate-700 text-[#7C3AED] text-xs font-bold rounded-lg border border-[#7C3AED]/30 shadow-sm whitespace-nowrap">
              {avatarPreview ? "Change Photo" : "Upload Photo"}
            </button>
            <input ref={fileInputRef} type="file" className="hidden" onChange={onAvatarPick} />
            {avatarPreview && <img src={avatarPreview} className="w-8 h-8 rounded-full object-cover border border-[#7C3AED]" alt="Preview" />}
            {!avatarPreview && <span className="text-[10px] text-[#5B21B6]/70 italic">Optional (JPG/PNG)</span>}
          </div>

          <button disabled={loading} type="submit" className="w-full h-12 bg-[#7C3AED] text-white font-bold rounded-xl shadow-md shadow-[#7C3AED]/20 hover:bg-[#EDE9FE] hover:text-[#7C3AED] active:scale-95 transition-all mt-2 border border-[#7C3AED]/40">
            {loading ? "Please wait..." : "Register"}
          </button>

          {message && <p className={`text-center text-[11px] font-medium ${isError ? "text-red-500" : "text-green-500"}`}>{message}</p>}
        </form>

        <div className="mt-6 text-center border-t border-[#7C3AED]/30 dark:border-slate-800 pt-4">
          <p className="text-[#5B21B6]/70 text-[11px] mb-2">Already have an account?</p>
          <Link to="/login" className="text-[#7C3AED] font-bold text-xs hover:underline uppercase tracking-wider">Login Here</Link>
        </div>
      </main>
    </div>
  );
}

export default Register;

