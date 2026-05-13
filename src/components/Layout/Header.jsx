/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import React, { useMemo } from "react";
import LogoutButton from "./LogoutButton";
import useTheme from "../../hooks/useTheme";
import useAuth from "../../hooks/useAuth";
import useUserProfile from "../../hooks/useUserProfile";

const Header = ({ title, toggleMobileMenu }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, role } = useAuth();
  const profile = useUserProfile(user?.email);
  const profileName = profile?.name || "";
  const avatarUrl = profile?.avatar_url || "";

  const displayName = profileName || user?.email?.split("@")?.[0] || "User";
  const displayRole = role === "admin" ? "Admin" : "User";
  const initials = useMemo(() => {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return displayName.slice(0, 2).toUpperCase();
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }, [displayName]);

  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#0f172a]/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800/60 h-16 flex items-center justify-between px-4 sm:px-6 2xl:px-8 transition-all">
      {/* Left side */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-800/50 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onClick={toggleMobileMenu}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight hidden sm:block">
          {title}
        </h1>
      </div>

      {/* Right side (actions) */}
      <div className="flex items-center justify-end gap-2 sm:gap-3 flex-1">
        
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-amber-400 transition-colors focus:outline-none rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Notifications */}
        <button className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors relative focus:outline-none rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
        </button>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

        {/* User Info */}
        <div className="flex items-center gap-3 pl-1 sm:pl-2">
          <div className="hidden sm:flex flex-col items-end text-sm">
            <span className="font-medium text-gray-900 dark:text-gray-200">{displayName}</span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{displayRole}</span>
          </div>
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center border border-indigo-200 dark:border-indigo-800 flex-shrink-0 cursor-pointer hover:shadow-md transition">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${displayName} avatar`}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-indigo-700 dark:text-indigo-400 font-bold text-sm">{initials}</span>
            )}
          </div>
        </div>

        {/* Logout */}
        <div className="ml-1 sm:ml-2">
           <LogoutButton />
        </div>
      </div>
    </header>
  );
};

export default Header;

