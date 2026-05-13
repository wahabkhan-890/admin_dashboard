/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import React from "react";
import Spinner from "./Spinner";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",  // primary, secondary, danger, ghost, soft, success
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  fullWidth = false,
  icon: Icon,
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:ring-indigo-500 shadow-sm shadow-indigo-200 dark:shadow-none",
    secondary: "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-indigo-500 shadow-sm",
    danger: "bg-red-600 text-white hover:bg-red-700 dark:hover:bg-red-500 focus:ring-red-500 shadow-sm shadow-red-200 dark:shadow-none",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 dark:hover:bg-emerald-500 focus:ring-emerald-500 shadow-sm shadow-emerald-200 dark:shadow-none",
    ghost: "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100 focus:ring-gray-400",
    soft: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 focus:ring-indigo-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs sm:text-sm rounded-md md:rounded-lg",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-xl",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
    >
      {loading ? (
        <Spinner className={`w-4 h-4 mr-2 ${variant === 'ghost' || variant === 'secondary' ? 'text-indigo-500' : 'text-white'}`} />
      ) : Icon ? (
        <Icon className={`w-4 h-4 ${children ? "mr-1.5" : ""}`} />
      ) : null}
      {children}
    </button>
  );
};

export default Button;

