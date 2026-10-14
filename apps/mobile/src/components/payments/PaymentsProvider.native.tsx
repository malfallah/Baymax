import { StripeProvider } from '@stripe/stripe-react-native';
import type { ReactElement } from 'react';
import { STRIPE_PUBLISHABLE_KEY } from '@/lib/config';

export function PaymentsProvider({ children }: { children: ReactElement | ReactElement[] }) {
  if (!STRIPE_PUBLISHABLE_KEY) return <>{children}</>;
  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.itismoe.baymax"
      urlScheme="baymax"
    >
      {children}
    </StripeProvider>
  );
}
