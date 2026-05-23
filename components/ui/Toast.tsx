"use client";
import { createContext, useContext, useState, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  addToast: (message: string, type?: ToastItem["type"]) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastItem["type"] = "success") => {
    const id = Math.random().toString(36);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons = { success: CheckCircle, error: AlertCircle, info: Info };
  const colors = {
    success: "border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800",
    error: "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800",
    info: "border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800",
  };
  const iconColors = { success: "text-emerald-500", error: "text-red-500", info: "text-blue-500" };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = icons[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm ${colors[toast.type]}`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${iconColors[toast.type]}`} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-1">{toast.message}</span>
                <button onClick={() => remove(toast.id)} className="p-0.5 rounded hover:bg-black/5">
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}

// Simple module-level toast for direct calls
let _toast: ((msg: string, type?: ToastItem["type"]) => void) | null = null;
export const toast = {
  success: (msg: string) => _toast?.(msg, "success"),
  error: (msg: string) => _toast?.(msg, "error"),
  info: (msg: string) => _toast?.(msg, "info"),
  _register: (fn: typeof _toast) => { _toast = fn; },
};
