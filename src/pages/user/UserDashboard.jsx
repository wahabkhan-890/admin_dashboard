/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import { useEffect, useMemo, useState } from "react";
import Card from "../../components/UI/Card";
import Badge from "../../components/UI/Badge";
import useAuth from "../../hooks/useAuth";
import { supabase } from "../../services/supabase";
import Spinner from "../../components/UI/Spinner";
import Button from "../../components/UI/Button";

function UserDashboard() {
  /*
  ========================
  SECTION: DASHBOARD STATE
  ========================
  */
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [nowTs, setNowTs] = useState(0);

  /*
  ========================
  SECTION: PROFILE FETCH LOGIC
  ========================
  */
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      if (!navigator.onLine) {
        setIsOffline(true);
        setError("You are offline. Please check your internet connection.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const { data, error: fetchError } = await supabase
          .from("users")
          .select("name, email, role, status, avatar_url, created_at")
          .ilike("email", user.email)
          .maybeSingle();

        if (fetchError) {
          setError(fetchError.message || "Failed to load dashboard profile.");
          setLoading(false);
          return;
        }

        setProfile(data || null);
      } catch {
        setIsOffline(!navigator.onLine);
        setError(
          navigator.onLine
            ? "Failed to load dashboard profile. Please try again."
            : "You are offline. Please check your internet connection."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();

    const onOffline = () => {
      setIsOffline(true);
      setError("You are offline. Please check your internet connection.");
    };

    const onOnline = () => {
      setIsOffline(false);
      loadProfile();
    };

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);

    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [user?.email]);

  /*
  ========================
  SECTION: TIME SNAPSHOT LOGIC
  ========================
  */
  useEffect(() => {
    const timer = setTimeout(() => {
      setNowTs(Date.now());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  /*
  ========================
  SECTION: PROFILE DERIVED VALUES
  ========================
  */
  const displayName = profile?.name?.trim() || user?.email?.split("@")?.[0] || "User";
  const avatarUrl = profile?.avatar_url || "";

  const initials = useMemo(() => {
    const source = displayName.trim() || "U";
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }, [displayName]);

  const role = (profile?.role || "user").toLowerCase();
  const status = (profile?.status || "inactive").toLowerCase();

  const joinedLabel = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      })
    : "Unknown";

  /*
  ========================
  SECTION: RELATIVE TIME FORMATTER
  ========================
  */
  const getRelativeTime = (inputDate) => {
    if (!inputDate) return "Unknown";
    const date = new Date(inputDate);
    if (Number.isNaN(date.getTime())) return "Unknown";

    const diffMs = date.getTime() - nowTs;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

    if (Math.abs(diffMs) < hour) return rtf.format(Math.round(diffMs / minute), "minute");
    if (Math.abs(diffMs) < day) return rtf.format(Math.round(diffMs / hour), "hour");
    return rtf.format(Math.round(diffMs / day), "day");
  };

  /*
  ========================
  SECTION: DASHBOARD STAT MODEL
  ========================
  */
  const statCards = [
    {
      title: "Account Status",
      value: status === "active" ? "Active" : "Inactive",
      icon: "\u2705",
      badge:
        status === "active" ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="danger">Inactive</Badge>
        ),
    },
    {
      title: "Member Since",
      value: joinedLabel,
      icon: "\uD83D\uDCC5",
    },
    {
      title: "Last Login",
      value: nowTs > 0 ? getRelativeTime(user?.last_sign_in_at) : "Unknown",
      icon: "\u23F1",
    },
    {
      title: "Profile Status",
      value: avatarUrl ? "Complete" : "Add Photo",
      icon: "\uD83D\uDC64",
      badge: avatarUrl ? <Badge variant="success">Complete</Badge> : <Badge variant="warning">Add Photo</Badge>,
    },
  ];

  const hasStatsData = Boolean(profile);

  /*
  ========================
  SECTION: DASHBOARD UI
  ========================
  */
  return (
    <div className="space-y-8 animate-fade-in bg-gradient-to-b from-purple-50/60 via-purple-50/30 to-white dark:from-[#15161d] dark:via-[#1a1720] dark:to-[#12131a] rounded-3xl p-4 sm:p-6 text-[#5B21B6] dark:text-white">
      <Card className="border border-[#7C3AED]/25 shadow-xl shadow-[#7C3AED]/5 bg-white dark:bg-[#1e1f26] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C3AED]/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner className="w-8 h-8" color="text-[#7C3AED]" />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-[#7C3AED] to-purple-300 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="relative w-24 h-24 rounded-full object-cover border-4 border-white dark:border-[#292931] shadow-md"
                />
              ) : (
                <div className="relative w-24 h-24 rounded-full bg-[#7C3AED]/10 dark:bg-[#292931] text-[#7C3AED] flex items-center justify-center text-2xl font-black border-4 border-white dark:border-[#292931] shadow-md">
                  {initials}
                </div>
              )}
            </div>

            <div className="text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h1 className="text-2xl md:text-4xl font-extrabold text-[#5B21B6] dark:text-white tracking-tight">
                  Hi, {displayName} ??
                </h1>
                <div className="flex justify-center md:justify-start">
                  <Badge
                    variant={role === "admin" ? "primary" : "neutral"}
                    className="px-3 py-1 text-[10px] font-bold tracking-widest bg-[#7C3AED]/10 text-[#7C3AED] border-none uppercase"
                  >
                    {role}
                  </Badge>
                </div>
              </div>

              <p className="text-sm font-medium text-[#5B21B6]/80 dark:text-white/80 max-w-md">
                {profile?.email || user?.email || "No email provided"}
              </p>
            </div>
          </div>
        )}
      </Card>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-300 text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-lg">??</span>
            <p className="font-medium">{error}</p>
          </div>
          {isOffline && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-1.5 bg-white dark:bg-[#292931] rounded-lg border border-red-200 dark:border-red-900/40 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => (
          <Card
            key={idx}
            tabIndex={0}
            className="border border-[#7C3AED]/25 shadow-lg shadow-slate-200/50 dark:shadow-black/20 hover:scale-[1.02] transition-all duration-300 bg-[#EDE9FE]/65 dark:bg-[#1e1f26] p-3.5 border-b-4 border-b-[#7C3AED]/30 hover:border-b-[#7C3AED] hover:bg-purple-50/60 dark:hover:bg-[#7C3AED]/12 hover:border-[#7C3AED]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/35 focus-visible:bg-purple-50/70 dark:focus-visible:bg-[#7C3AED]/12 focus-visible:border-[#7C3AED]/50"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B21B6]/70 dark:text-white/70">{card.title}</span>
              <span className="text-base opacity-80">{card.icon}</span>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-bold text-[#5B21B6] dark:text-white">
                {loading ? (
                  <span className="block w-20 h-6 bg-slate-100 dark:bg-[#292931] animate-pulse rounded"></span>
                ) : (
                  card.value
                )}
              </p>
              {!loading && card.badge && <div>{card.badge}</div>}
            </div>
          </Card>
        ))}
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#EDE9FE]/65 dark:bg-[#1e1f26] border border-[#7C3AED]/25 dark:border-[#7C3AED]/25 rounded-3xl p-8 shadow-lg shadow-slate-200/40 dark:shadow-black/20 transition-all duration-300 hover:border-[#7C3AED]/40 hover:bg-purple-50/40 dark:hover:bg-[#7C3AED]/12">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-[#7C3AED]/10 flex items-center justify-center text-2xl">{"\uD83D\uDCC8"}</div>
            <div>
              <h3 className="text-2xl font-extrabold text-[#5B21B6] dark:text-white">Performance Overview</h3>
              <p className="text-sm text-[#5B21B6]/80 dark:text-white/80">Your dashboard activity and account insights are running smoothly.</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-[#5B21B6]/85 dark:text-white/80">
            Your account setup is in a strong state. Completing remaining profile details will improve personalization and dashboard relevance.
          </p>
        </div>

        <div className="bg-[#EDE9FE]/65 dark:bg-[#1e1f26] border border-[#7C3AED]/25 dark:border-[#7C3AED]/25 rounded-3xl p-8 shadow-lg shadow-slate-200/40 dark:shadow-black/20 transition-all duration-300 hover:border-[#7C3AED]/40 hover:bg-purple-50/40 dark:hover:bg-[#7C3AED]/12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#7C3AED]/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#7C3AED]/10 flex items-center justify-center text-2xl">{"\uD83D\uDD12"}</div>
              <div>
                <h3 className="text-2xl font-extrabold text-[#5B21B6] dark:text-white">Security Center</h3>
                <p className="text-sm text-[#5B21B6]/80 dark:text-white/80">Your account is protected with modern encrypted authentication.</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-[#5B21B6]/85 dark:text-white/80">
              Security controls are active and continuously monitoring sign-in and session behavior to maintain account integrity.
            </p>
          </div>
        </div>
      </section>

      {!loading && !error && !hasStatsData && (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-[#292931]/45 rounded-[2.5rem] border border-dashed border-[#7C3AED]/35 dark:border-[#7C3AED]/30">
          <p className="text-[#5B21B6]/75 dark:text-white/75 font-medium mb-4">No profile activity found</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Refresh Dashboard
          </Button>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;

