import type { ReactNode } from 'react';

/** Web has no native payment sheet; card payments are simulated or handled server-side. */
export function PaymentsProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
