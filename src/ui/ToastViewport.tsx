import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';

import { useToastStore, type ToastTone } from '../features/toasts/toast.store';

const toneIconMap: Record<ToastTone, typeof CheckCircle2> = {
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
  error: XCircle,
};

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = toneIconMap[toast.tone];

          return (
            <motion.div
              key={toast.id}
              className={`toast toast--${toast.tone}`}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="toast__icon">
                <Icon size={18} />
              </div>
              <div className="toast__content">
                <strong>{toast.title}</strong>
                {toast.description ? <p>{toast.description}</p> : null}
              </div>
              <button
                type="button"
                className="toast__close"
                aria-label="Chiudi notifica"
                onClick={() => dismissToast(toast.id)}
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
