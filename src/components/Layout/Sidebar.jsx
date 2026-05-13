/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import React, { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useUserProfile from "../../hooks/useUserProfile";
import TypewriterText from "../UI/TypewriterText";

const SIDEBAR_ITEMS = [
  { path: "/admin/dashboard", label: "Dashboard", role: "admin", icon: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
  )},
  { path: "/admin/audit-logs", label: "Audit Logs", role: "admin", icon: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
  )},
  { path: "/admin/settings", label: "Settings", role: "admin", icon: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
  )},
  // User Routes
  { path: "/dashboard", label: "Dashboard", role: "user", icon: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
  )},
  { path: "/settings", label: "Settings", role: "user", icon: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
  )},
];

const Sidebar = ({ isCollapsed, setCollapsed }) => {
  const { user, role } = useAuth();
  const location = useLocation();
  const profile = useUserProfile(user?.email);
  const profileName = profile?.name?.trim() || "";

  const normalizedRole = role === "admin" ? "admin" : "user";
  const linksToShow = SIDEBAR_ITEMS.filter((item) => item.role === normalizedRole);
  const accountLabel = normalizedRole === "admin" ? "Admin Account" : "User Account";

  const sidegarName = profileName || user?.email?.split("@")?.[0] || "User";
  const sidegarInitials = useMemo(() => {
    const source = sidegarName.trim() || "U";
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }, [sidegarName]);

  return (
    <aside
      className={`
        sticky top-0 hidden h-screen md:flex flex-col z-20 transition-all duration-300 ease-in-out
        bg-white/95 dark:bg-[rgba(18,19,26,0.75)] backdrop-blur-2xl border-r border-purple-200/70 dark:border-white/10 text-[#5B21B6] dark:text-white
        ${isCollapsed ? "w-24" : "w-[300px]"}
      `}
    >
      <div className="px-4 pt-8 pb-6">
        <div className="flex items-center gap-4 px-2 overflow-hidden">
          <div className="w-11 h-11 rounded-2xl bg-[#7C3AED] text-[#ffffff] flex items-center justify-center font-extrabold shadow-xl shadow-[#7C3AED]/25 border border-white/15">
            N
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-[#5B21B6] dark:text-white text-lg font-bold leading-none tracking-tight">
                <TypewriterText text="Nexus" speed="1.8s" />
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#5B21B6]/80 dark:text-white/75">Enterprise Suite</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-1.5 custom-scrollbar">
        {linksToShow.map((item) => {
          const isActive = location.pathname.includes(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group
                ${isActive
                  ? "bg-[#7C3AED]/10 text-[#5B21B6] dark:text-[#C4B5FD] border border-[#7C3AED]/25 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-1 before:rounded-r before:bg-[#7C3AED]"
                  : "text-[#5B21B6] dark:text-white/90 hover:text-[#5B21B6] dark:hover:text-white hover:bg-purple-50 dark:hover:bg-white/5"}
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <div className={`${isActive ? "text-[#5B21B6] dark:text-white" : "text-[#5B21B6]/70 dark:text-white/70 group-hover:text-[#5B21B6] dark:group-hover:text-white"}`}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className={`text-sm font-medium ${isActive ? "text-[#5B21B6] dark:text-white" : "text-[#5B21B6] dark:text-white/90"}`}>{item.label}</span>
              )}
              {isActive && !isCollapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#7C3AED]"></div>}
            </NavLink>
          );
        })}

        {!isCollapsed && (
          <div className="mt-6 px-2">
            <div className="rounded-2xl border border-[#7C3AED]/20 bg-gradient-to-br from-[#7C3AED]/12 to-transparent dark:from-[#7C3AED]/20 p-4 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-[#7C3AED]/10 blur-2xl"></div>
              <div className="relative z-10 space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#C4B5FD]">Upgrade to Pro</p>
                <p className="text-[11px] text-[#5B21B6]/90 dark:text-white/85 leading-relaxed">Unlock advanced analytics and unlimited team members.</p>
                <button className="w-full py-2.5 rounded-xl bg-[#7C3AED] text-[#ffffff] text-xs font-bold hover:brightness-110 transition-all">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-purple-200/70 dark:border-white/10 space-y-3">
        {!isCollapsed && (
          <div className="px-3 py-3 rounded-xl text-[#5B21B6] dark:text-white/90 hover:text-[#5B21B6] dark:hover:text-white transition-colors cursor-pointer">
            Support
          </div>
        )}
        {!isCollapsed && (
          <div className="p-3 rounded-2xl bg-purple-50/65 dark:bg-white/5 border border-purple-200/70 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white dark:bg-[#33343c] border border-[#7C3AED]/30 flex items-center justify-center text-[11px] font-bold text-[#5B21B6] dark:text-[#C4B5FD]">
                {sidegarInitials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#5B21B6] dark:text-white truncate">{sidegarName}</p>
                <p className="text-[10px] text-[#5B21B6]/80 dark:text-white/75 truncate">{accountLabel}</p>
              </div>
            </div>
            <button className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 text-[#5B21B6]/80 dark:text-white/80 hover:text-[#5B21B6] dark:hover:text-white hover:bg-[#7C3AED]/10 transition-colors">
              {"->"}
            </button>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!isCollapsed)}
          className="flex items-center justify-center w-full p-2.5 rounded-xl bg-purple-50 dark:bg-white/5 hover:bg-purple-100 dark:hover:bg-white/10 text-[#5B21B6] dark:text-white hover:text-[#5B21B6] dark:hover:text-white transition-colors"
        >
          {isCollapsed ? (
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
          ) : (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/></svg>
              <span className="text-sm font-medium">Collapse</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

