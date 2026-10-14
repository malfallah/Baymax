import type { PaymentIntentResult } from '@baymax/shared';

export type PaymentOutcome = 'paid' | 'cancelled';

/**
 * Web: demo payments are confirmed directly. Real Stripe payments are taken
 * through the native PaymentSheet on iOS/Android.
 */
export function usePayment() {
  return {
    supportsCardPayments: false,
    pay: async (payment: PaymentIntentResult): Promise<PaymentOutcome> => {
      if (payment.provider === 'stripe') {
        throw new Error(
          'Card payments are available in the Baymax mobile app. Please complete this order on iOS or Android.',
        );
      }
      return 'paid';
    },
  };
}
