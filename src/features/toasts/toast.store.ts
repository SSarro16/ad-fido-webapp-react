import { create } from 'zustand';

export type ToastTone = 'success' | 'info' | 'warning' | 'error';

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastInput = Omit<ToastItem, 'id'>;

type ToastState = {
  toasts: ToastItem[];
  pushToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
};

const toastTimers = new Map<string, number>();

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  pushToast: (toast) => {
    const id = crypto.randomUUID();

    set((state) => ({
      toasts: [...state.toasts, { id, ...toast }],
    }));

    const timeoutId = window.setTimeout(() => {
      toastTimers.delete(id);
      set((state) => ({
        toasts: state.toasts.filter((item) => item.id !== id),
      }));
    }, 4200);
    toastTimers.set(id, timeoutId);

    return id;
  },
  dismissToast: (id) => {
    const timeoutId = toastTimers.get(id);

    if (timeoutId) {
      window.clearTimeout(timeoutId);
      toastTimers.delete(id);
    }

    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));
