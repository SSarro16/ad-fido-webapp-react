import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useToastStore } from './toast.store';

beforeEach(() => {
  vi.useFakeTimers();
  useToastStore.setState({ toasts: [] });
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe('toast.store', () => {
  it('auto dismisses toasts after the default timeout', () => {
    useToastStore.getState().pushToast({
      title: 'Salvato',
      description: 'Operazione completata.',
      tone: 'success',
    });

    expect(useToastStore.getState().toasts).toHaveLength(1);

    vi.advanceTimersByTime(4200);

    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('clears manual dismiss without waiting for the timer', () => {
    const toastId = useToastStore.getState().pushToast({
      title: 'Attenzione',
      description: 'Messaggio di test.',
      tone: 'warning',
    });

    useToastStore.getState().dismissToast(toastId);

    expect(useToastStore.getState().toasts).toHaveLength(0);

    vi.advanceTimersByTime(4200);

    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('does not enqueue duplicate toasts while one with the same content is already visible', () => {
    useToastStore.getState().pushToast({
      title: 'Salvato',
      description: 'Operazione completata.',
      tone: 'success',
    });

    useToastStore.getState().pushToast({
      title: 'Salvato',
      description: 'Operazione completata.',
      tone: 'success',
    });

    expect(useToastStore.getState().toasts).toHaveLength(1);
  });
});
