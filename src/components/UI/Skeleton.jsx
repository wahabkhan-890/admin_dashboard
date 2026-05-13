/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import React from "react";

export const Skeleton = ({ className = "", variant = "rectangular" }) => {
  const baseStyles = "bg-gray-200 dark:bg-gray-800 animate-pulse";
  
  const variants = {
    rectangular: "rounded-md",
    circular: "rounded-full",
    text: "rounded h-4 w-3/4",
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`} />
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden p-6 transition-colors duration-300">
      <div className="flex gap-4 border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-5 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`r-${r}`} className="flex gap-4 py-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={`c-${r}-${c}`} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

