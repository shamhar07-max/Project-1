import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const timer = useRef(null);

  const toast = useCallback((text) => {
    setMessage(text);
    setVisible(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 4200);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className={
          "toast fixed bottom-5 right-5 z-50 max-w-sm rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white shadow-lg " +
          (visible ? "" : "toast-hidden")
        }
        aria-live="polite"
      >
        {message}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
