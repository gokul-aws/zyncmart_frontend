import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * false during server render and hydration, true afterwards. For UI that
 * depends on browser-only state (localStorage-backed stores) without a
 * setState-in-effect re-render.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
