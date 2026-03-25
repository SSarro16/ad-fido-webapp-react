import { useToastStore, type ToastTone } from './toast.store';

type ShowToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
};

export function useToast() {
  const pushToast = useToastStore((state) => state.pushToast);

  return {
    showToast: ({ title, description, tone = 'info' }: ShowToastInput) =>
      pushToast({ title, description, tone }),
  };
}
