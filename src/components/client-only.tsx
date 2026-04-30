'use client';

import { useSyncExternalStore, type ReactNode } from 'react';

const emptySubscribe = () => () => {};

/**
 * Wrapper that only renders children after the component has mounted on the client.
 * Prevents hydration mismatches caused by browser-only APIs, animations, or
 * third-party libraries that behave differently during SSR vs client rendering.
 */
export function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
