/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import { createContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import Spinner from "../components/UI/Spinner";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(true);
  const [registrationJustCompleted, setRegistrationJustCompleted] = useState(false);

  useEffect(() => {
    const fetchRole = async (email) => {
      const cleanEmail = email?.trim(); // FIX: DB/email compare case-sensitive mismatch avoid karne ke liye original value preserve rakhi
      if (!cleanEmail) { // FIX: invalid email par unnecessary query se bachna
        setRole(null); // FIX: email missing ho to role deterministically null rahe
        setStatus("active");
        return;
      }
      const { data, error } = await supabase
        .from("users")
        .select("role, status")
        .ilike("email", cleanEmail) // FIX: email ko case-insensitive match karna zaroori hai, warna role null aa jata hai
        .maybeSingle(); // FIX: no-row pe crash ke bajaye graceful null handling

      if (error) { // FIX: query/RLS error pe silent fail ke bajaye explicit null set karna
        if (import.meta.env.DEV) {
          console.error("Role fetch failed:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            email: cleanEmail,
          });
        }
        setRole(null); // FIX: stale role value avoid karne ke liye error case mein clear karna
        setStatus("active");
        return;
      }
      const normalizedRole = data?.role?.trim()?.toLowerCase() || null;
      const normalizedStatus = data?.status?.trim()?.toLowerCase() || "active";
      setRole(normalizedRole);
      setStatus(normalizedStatus);

      if (normalizedStatus === "inactive") {
        await supabase.auth.signOut();
        setUser(null);
        setRole(null);
        setStatus("inactive");
      }
    };

    const getUser = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const sessionUser = sessionData?.session?.user || null;

        const { data } = await supabase.auth.getUser();
        const currentUser = sessionUser || data?.user || null;

        setUser(currentUser);

        if (currentUser) {
          await fetchRole(currentUser.email);
        }
      } finally {
        // FIX: agar role query fail/hang ho to bhi loading state stuck na rahe
        setLoading(false);
      }
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user || null;

      setUser(currentUser);

      if (currentUser) {
        setLoading(true);
        // FIX: auth callback ke andar direct await Supabase query event loop ko block kar sakta hai
        setTimeout(() => {
          fetchRole(currentUser.email).finally(() => {
            // FIX: role fetch complete/fail dono halat mein loading close ho
            setLoading(false);
          });
        }, 0);
        return;
      }

      setRole(null);
      setStatus("active");
      setLoading(false);
    });

    return () => {
      // FIX: safe cleanup taake listener leak na ho
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  const effectiveUser = registrationJustCompleted ? null : user;

  return (
    <AuthContext.Provider
      value={{
        user: effectiveUser,
        role,
        status,
        loading,
        registrationJustCompleted,
        setRegistrationJustCompleted,
      }}
    >
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
            <Spinner className="w-6 h-6" color="text-indigo-500" />
            <span className="text-sm font-medium">Loading your workspace...</span>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
export { AuthContext };

