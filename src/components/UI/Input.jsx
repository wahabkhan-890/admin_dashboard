/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import React, { forwardRef } from "react";

const Input = forwardRef(({
  label,
  type = "text",
  id,
  name,
  value,
  onChange,
  placeholder,
  error,
  className = "",
  disabled = false,
  icon: Icon,
  required = false,
  autoComplete,
  readOnly = false,
  ...rest
}, ref) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label htmlFor={id} className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          ref={ref}
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          autoComplete={autoComplete}
          {...rest}
          className={`
            w-full bg-white dark:bg-[#0B0F19] border outline-none transition-all duration-200 text-gray-900 dark:text-gray-100 sm:text-sm rounded-lg block
            ${Icon ? 'pl-10' : 'px-3'} py-2.5
            ${error 
              ? 'border-red-300 dark:border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 dark:focus:ring-red-500/10' 
              : 'border-gray-300 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/10'}
            ${disabled ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-800' : 'hover:border-gray-400 dark:hover:border-gray-600'}
          `}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>}
    </div>
  );
});

export default Input;

