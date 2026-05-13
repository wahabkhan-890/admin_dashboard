/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import { createContext, useCallback, useMemo, useState } from "react";

const ToastContext = createContext(null);

function ToastItem({ toast, onClose }) {
  const color =
    toast.type === "error"
      ? "bg-red-600"
      : toast.type === "success"
        ? "bg-green-600"
        : "bg-slate-700";

  return (
    <div className={`${color} text-white px-4 py-3 rounded-lg shadow-md min-w-64`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm">{toast.message}</p>
        <button className="text-white/80 hover:text-white" onClick={() => onClose(toast.id)}>
          x
        </button>
      </div>
    </div>
  );
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
export { ToastContext };

