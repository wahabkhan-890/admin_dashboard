/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import React from "react";
import Spinner from "./Spinner";

const Table = ({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No data found.",
  onRowClick,
  onEmptyAction,
  emptyActionLabel = "Retry",
}) => {
  return (
    <div className="w-full overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#111827] shadow-sm transition-colors duration-300">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50/50 dark:bg-[#0B0F19] border-b border-gray-200 dark:border-gray-800">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} scope="col" className="px-6 py-4 font-semibold tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Spinner className="w-8 h-8 text-indigo-500 mb-3" />
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data && data.length > 0 ? (
              data.map((row, rowIdx) => (
                <tr 
                  key={rowIdx} 
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`bg-white dark:bg-[#111827] border-b border-gray-100 dark:border-gray-800/60 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-4 whitespace-nowrap">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <svg className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <span>{emptyMessage}</span>
                    {onEmptyAction ? (
                      <button
                        type="button"
                        onClick={onEmptyAction}
                        className="mt-4 text-xs px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors duration-200"
                      >
                        {emptyActionLabel}
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;

