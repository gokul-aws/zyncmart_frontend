import { useRef, useCallback } from 'react';

// Guards against a fast double-click (or double-submit) firing a submit
// handler twice before a `disabled` prop's re-render lands — the `loading`
// state alone updates one render too late to catch that. Mirrors the
// `inFlight` ref pattern in hooks/useAuth.ts, wrapped so components never
// touch the ref directly in a function they hand to react-hook-form's
// `handleSubmit` (that pattern trips the react-hooks/refs lint rule).
export function useSubmitGuard() {
  const inFlight = useRef(false);

  return useCallback(async (fn: () => Promise<void> | void) => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      await fn();
    } finally {
      inFlight.current = false;
    }
  }, []);
}
