/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../services/supabase";
import useAuth from "../../hooks/useAuth";
import useToast from "../../hooks/useToast";
import { toUserMessage } from "../../services/api";
import { useNavigate } from "react-router-dom";

function Settings() {
  /*
  ========================
  SECTION: SETTINGS STATE
  ========================
  */
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const confirmDeleteInputRef = useRef(null);
  const [name, setName] = useState("");
  const [currentName, setCurrentName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [password, setPassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const createTraceId = () => `DEL-${Math.floor(100000 + Math.random() * 900000)}`;

  /*
  ========================
  SECTION: PROFILE LOAD API
  ========================
  */
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.email) return;
      const { data, error } = await supabase
        .from("users")
        .select("name, avatar_url")
        .ilike("email", user.email)
        .maybeSingle();

      if (error) {
        showToast(`Could not load profile: ${toUserMessage(error)}`, "error");
        return;
      }

      setCurrentName(data?.name || "");
      setName(data?.name || "");
      setAvatarUrl(data?.avatar_url || "");
    };

    loadProfile();
  }, [showToast, user?.email]);

  /*
  ========================
  SECTION: AVATAR PREVIEW CLEANUP
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
  SECTION: DELETE CONFIRM UX
  ========================
  */
  useEffect(() => {
    confirmDeleteInputRef.current?.focus();
  }, []);

  /*
  ========================
  SECTION: VIEW DERIVED VALUES
  ========================
  */
  const avatarSrc = avatarPreview || avatarUrl || "";
  const initials = useMemo(() => {
    const base = name.trim() || currentName.trim() || user?.email || "U";
    const parts = base.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }, [currentName, name, user?.email]);

  /*
  ========================
  SECTION: AVATAR VALIDATION LOGIC
  ========================
  */
  const onAvatarPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      showToast("Only JPG and PNG files are allowed.", "error");
      e.target.value = "";
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      showToast("Image size must be 2MB or less.", "error");
      e.target.value = "";
      return;
    }

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  /*
  ========================
  SECTION: PROFILE UPDATE API
  ========================
  */
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName && !avatarFile) {
      showToast("Add a name or select an avatar to save.", "error");
      return;
    }

    setSavingProfile(true);
    let nextAvatarUrl = avatarUrl;

    if (avatarFile) {
      const extension = avatarFile.type === "image/png" ? "png" : "jpg";
      const filePath = `${(user?.email || "unknown").toLowerCase()}/avatar-${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true, contentType: avatarFile.type });

      if (uploadError) {
        setSavingProfile(false);
        showToast(`Avatar upload failed: ${toUserMessage(uploadError)}`, "error");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      nextAvatarUrl = publicUrlData?.publicUrl || "";
    }

    const updates = {};
    if (trimmedName && trimmedName !== currentName) {
      updates.name = trimmedName;
    }
    if (avatarFile && nextAvatarUrl) {
      updates.avatar_url = nextAvatarUrl;
    }

    if (Object.keys(updates).length === 0) {
      setSavingProfile(false);
      showToast("No profile changes to save.", "error");
      return;
    }

    const { error } = await supabase
      .from("users")
      .update(updates)
      .ilike("email", user?.email || "");
    setSavingProfile(false);

    if (error) {
      showToast(`Profile update failed: ${toUserMessage(error)}`, "error");
      return;
    }

    if (updates.name) {
      setCurrentName(updates.name);
      setName(updates.name);
    }
    if (updates.avatar_url) {
      setAvatarUrl(updates.avatar_url);
      setAvatarFile(null);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview("");
    }
    showToast("Profile updated.", "success");
  };

  /*
  ========================
  SECTION: PASSWORD UPDATE API
  ========================
  */
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }

    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSavingPassword(false);

    if (error) {
      showToast(`Password update failed: ${toUserMessage(error)}`, "error");
      return;
    }

    setPassword("");
    showToast("Password changed successfully.", "success");
  };

  /*
  ========================
  SECTION: ACCOUNT DELETE API
  ========================
  */
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (confirmDelete !== "DELETE") {
      showToast("Type DELETE to confirm account deletion.", "error");
      return;
    }
    const traceId = createTraceId();
    setDeleting(true);
    try {
      console.log("[delete-account] request sent", { traceId });
      const { data, error } = await supabase.functions.invoke("delete-account", {
        method: "POST",
        body: { traceId },
      });
      console.log("[delete-account] response received", {
        traceId,
        success: data?.success ?? null,
        step: data?.step ?? null,
      });

      if (error) {
        console.log("[delete-account] error received", { traceId, message: error.message });
        let detailedMessage = toUserMessage(error);
        try {
          const contextJson = await error.context?.json?.();
          if (contextJson?.message || contextJson?.error) {
            detailedMessage = contextJson.message || contextJson.error;
          }
        } catch {
          // Keep fallback message.
        }
        setDeleting(false);
        showToast(`Account delete failed: ${detailedMessage} (Trace: ${traceId})`, "error");
        return;
      }

      if (!data?.success) {
        setDeleting(false);
        showToast(`Account delete failed: ${data?.message || data?.error || "Unknown delete error."} (Trace: ${traceId})`, "error");
        return;
      }
    } catch (err) {
      console.log("[delete-account] error received", {
        traceId,
        message: err instanceof Error ? err.message : "Unknown invoke error",
      });
      setDeleting(false);
      showToast(`Unexpected account delete error. (Trace: ${traceId})`, "error");
      return;
    }

    const { error: authError } = await supabase.auth.signOut();
    setDeleting(false);
    if (authError) {
      showToast(`Signout failed: ${toUserMessage(authError)}`, "error");
      return;
    }
    sessionStorage.setItem("recent_account_delete_at", String(Date.now()));
    showToast("Account deleted successfully.", "success");
    navigate("/register");
  };

  /*
  ========================
  SECTION: SETTINGS UI
  ========================
  */
  return (
    <div className="min-h-screen rounded-3xl p-4 sm:p-8 bg-gradient-to-b from-purple-50/55 via-purple-50/25 to-white dark:from-[#15161d] dark:via-[#12131a] dark:to-[#12131a] text-[#5B21B6] dark:text-white">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-[#5B21B6] dark:text-white">Settings</h1>
          <p className="text-sm text-[#5B21B6]/80 dark:text-white/80">Manage your public presence and account credentials.</p>
        </div>

        <section className="space-y-5">
          <h2 className="text-xl font-semibold text-[#5B21B6] dark:text-white">Profile Identity</h2>
          <form
            onSubmit={handleProfileUpdate}
            className="rounded-2xl border border-[#7C3AED]/25 bg-[#EDE9FE]/70 dark:border-[#574146]/50 dark:bg-[#1e1f26]/70 p-6 backdrop-blur-xl shadow-[0_16px_40px_-24px_rgba(124,58,237,0.28)]"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="relative">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="Profile avatar"
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-[#C4B5FD]/35"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-purple-100 text-[#5B21B6] dark:bg-[#33343c] dark:text-[#C4B5FD] text-2xl font-bold border-2 border-[#7C3AED]/35 flex items-center justify-center">
                    {initials}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-[#7C3AED] text-[#ffffff] font-bold shadow-lg shadow-[#7C3AED]/30 hover:bg-[#EDE9FE] hover:text-[#7C3AED]"
                >
                  ✎
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  className="hidden"
                  onChange={onAvatarPick}
                />
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wider uppercase text-[#5B21B6]/80 dark:text-white/80">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="New display name"
                    className="w-full h-11 rounded-xl px-4 bg-white dark:bg-[#1a1b22] border border-purple-200/70 dark:border-[#574146]/50 text-[#5B21B6] dark:text-white placeholder:text-[#5B21B6]/50 dark:placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/35 focus:border-[#7C3AED]"
                  />
                </div>
                <p className="text-xs text-[#5B21B6]/75 dark:text-white/70">JPG/PNG, max 2MB</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 rounded-xl bg-[#7C3AED] text-[#ffffff] font-semibold hover:bg-[#EDE9FE] hover:text-[#7C3AED] disabled:opacity-60"
              >
                {savingProfile ? "Saving..." : "Update Profile"}
              </button>
            </div>
          </form>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form
            onSubmit={handlePasswordUpdate}
            className="rounded-2xl border border-[#7C3AED]/25 bg-[#EDE9FE]/70 dark:border-[#574146]/50 dark:bg-[#1e1f26]/70 p-6 backdrop-blur-xl space-y-5 shadow-[0_16px_40px_-24px_rgba(124,58,237,0.28)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#959396]/15 text-[#c8c6c8] flex items-center justify-center">🛡️</div>
              <h3 className="text-lg font-semibold text-[#5B21B6] dark:text-white">Security & Access</h3>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wider uppercase text-[#5B21B6]/80 dark:text-white/80">Email Address</label>
              <input
                type="email"
                value={user?.email || ""}
                readOnly
                className="w-full h-11 rounded-xl px-4 bg-slate-100 dark:bg-[#0d0e15]/80 border border-purple-200/60 dark:border-[#574146]/40 text-[#5B21B6]/80 dark:text-white/80"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wider uppercase text-[#5B21B6]/80 dark:text-white/80">Current Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 rounded-xl px-4 bg-white dark:bg-[#1a1b22] border border-purple-200/70 dark:border-[#574146]/50 text-[#5B21B6] dark:text-white placeholder:text-[#5B21B6]/50 dark:placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/35 focus:border-[#7C3AED]"
              />
            </div>
            <button
              type="submit"
              disabled={savingPassword}
              className="w-full py-2.5 rounded-xl bg-slate-200 text-slate-800 dark:bg-[#33343c] dark:text-[#e3e1ec] font-semibold hover:bg-slate-300 dark:hover:bg-[#383941] disabled:opacity-60"
            >
              {savingPassword ? "Saving..." : "Change Password"}
            </button>
          </form>

          <div className="rounded-2xl border border-[#7C3AED]/25 bg-[#EDE9FE]/70 dark:border-[#574146]/50 dark:bg-[#1e1f26]/70 p-6 backdrop-blur-xl space-y-5 shadow-[0_16px_40px_-24px_rgba(124,58,237,0.28)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C4B5FD]/15 text-[#C4B5FD] flex items-center justify-center">🔔</div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Preferences</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-[#e3e1ec]">Desktop Notifications</p>
                  <p className="text-xs text-slate-500 dark:text-[#a58a90]">Real-time alerts for system events</p>
                </div>
                <span className="w-10 h-5 rounded-full bg-[#7C3AED] relative">
                  <span className="absolute right-1 top-1 w-3 h-3 rounded-full bg-white"></span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-[#e3e1ec]">Security Alerts</p>
                  <p className="text-xs text-slate-500 dark:text-[#a58a90]">Critical account safety updates</p>
                </div>
                <span className="w-10 h-5 rounded-full bg-[#7C3AED] relative">
                  <span className="absolute right-1 top-1 w-3 h-3 rounded-full bg-white"></span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-[#e3e1ec]">Marketing Emails</p>
                  <p className="text-xs text-slate-500 dark:text-[#a58a90]">Product updates and newsletters</p>
                </div>
                <span className="w-10 h-5 rounded-full bg-slate-300 dark:bg-[#33343c] relative">
                  <span className="absolute left-1 top-1 w-3 h-3 rounded-full bg-slate-100 dark:bg-[#ddbfc5]"></span>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-red-500 dark:text-[#ffb4ab]">
            <span>⚠</span>
            <h3 className="text-lg font-semibold">Danger Zone</h3>
          </div>
          <form
            onSubmit={handleDeleteAccount}
            className="rounded-2xl border border-red-300/60 bg-red-50/70 dark:border-[#ffb4ab]/30 dark:bg-[#93000a]/10 p-6 space-y-4"
          >
            <div>
              <p className="text-base font-semibold text-red-700 dark:text-[#ffdad6]">Delete Account</p>
              <p className="text-sm text-red-600/90 dark:text-[#ddbfc5]/85">This deletes your profile row. To continue, type DELETE.</p>
            </div>
            <input
              ref={confirmDeleteInputRef}
              type="text"
              value={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.value)}
              placeholder="Type DELETE"
              className="w-full h-11 rounded-xl px-4 bg-white dark:bg-[#1a1b22] border border-red-300/70 dark:border-[#ffb4ab]/35 text-slate-800 dark:text-[#e3e1ec] placeholder:text-slate-400 dark:placeholder:text-[#a58a90] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/35 focus:border-[#7C3AED]"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={deleting}
                className="px-6 py-2.5 rounded-xl bg-[#93000a] text-[#ffdad6] font-semibold hover:brightness-110 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Settings;

