/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import React from "react";

const Card = ({ children, className = "", noPadding = false }) => {
  return (
    <div className={`bg-white dark:bg-[#111827] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 ${className}`}>
      <div className={`${noPadding ? "" : "p-5 sm:p-6"}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;

