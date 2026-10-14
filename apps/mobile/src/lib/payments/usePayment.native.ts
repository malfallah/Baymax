import type { PaymentIntentResult } from '@baymax/shared';
import { useStripe } from '@stripe/stripe-react-native';
import type { PaymentOutcome } from './usePayment';

export type { PaymentOutcome };

/** Presents Stripe's native PaymentSheet for real payments; demo payments resolve immediately. */
export function usePayment() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  return {
    supportsCardPayments: true,
    pay: async (payment: PaymentIntentResult): Promise<PaymentOutcome> => {
      if (payment.provider !== 'stripe' || !payment.clientSecret) return 'paid';
      const init = await initPaymentSheet({
        merchantDisplayName: 'Baymax Pharmacy',
        paymentIntentClientSecret: payment.clientSecret,
        allowsDelayedPaymentMethods: false,
      });
      if (init.error) throw new Error(init.error.message);
      const result = await presentPaymentSheet();
      if (result.error) {
        if (result.error.code === 'Canceled') return 'cancelled';
        throw new Error(result.error.message);
      }
      return 'paid';
    },
  };
}
