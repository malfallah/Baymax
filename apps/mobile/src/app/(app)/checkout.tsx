import { shippingFor, shippingSchema } from '@baymax/shared';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { OrderSummary } from '@/components/domain/OrderSummary';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Icon,
  Screen,
  StackHeader,
  Text,
  TextField,
  toast,
} from '@/components/ui';
import { useConfirmOrder } from '@/hooks/queries';
import { useLayout } from '@/hooks/useLayout';
import { shopApi } from '@/lib/api/endpoints';
import { errorMessage } from '@/lib/api/errors';
import { IS_DEMO } from '@/lib/config';
import { formatMoney } from '@/lib/format';
import { validateForm, type FieldErrors } from '@/lib/forms';
import { usePayment } from '@/lib/payments/usePayment';
import { useAuth } from '@/stores/auth';
import { cartSubtotal, useCart } from '@/stores/cart';
import { useTheme } from '@/theme/ThemeProvider';

export default function Checkout() {
  const { colors, radius } = useTheme();
  const { isWide } = useLayout();
  const qc = useQueryClient();
  const user = useAuth((s) => s.user)!;
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const confirmOrder = useConfirmOrder();
  const payment = usePayment();
  const subtotal = cartSubtotal(lines);

  const [fullName, setFullName] = useState(user.fullName);
  // Pre-fill from the saved address: "742 Valencia St, San Francisco, CA" → street + city.
  const [savedStreet, ...savedCity] = (user.role === 'patient' ? (user.patient.address ?? '') : '')
    .split(',')
    .map((x) => x.trim());
  const [line1, setLine1] = useState(savedStreet ?? '');
  const [city, setCity] = useState(
    user.role === 'doctor' ? user.doctor.city : savedCity.join(', '),
  );
  const [phone, setPhone] = useState(user.phone ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const header = <StackHeader title="Checkout" fallbackHref="/cart" />;

  if (!lines.length) {
    return (
      <Screen header={header}>
        <EmptyState
          icon="cart-outline"
          title="Nothing to check out"
          actionLabel="Shop pharmacy"
          onAction={() => router.replace('/pharmacy')}
        />
      </Screen>
    );
  }

  const placeOrder = async () => {
    const { data: shipping, errors: e } = validateForm(shippingSchema, {
      fullName,
      line1,
      city,
      phone,
    });
    setErrors(e);
    if (!shipping) {
      toast.error('Please complete your delivery details');
      return;
    }
    setBusy(true);
    try {
      const { order, payment: intent } = await shopApi.createOrder({
        items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
        shipping,
      });
      const outcome = await payment.pay(intent);
      if (outcome === 'cancelled') {
        toast.info('Payment cancelled — your cart is saved');
        return;
      }
      await confirmOrder.mutateAsync(order.id);
      clear();
      qc.invalidateQueries({ queryKey: ['orders'] });
      router.replace({ pathname: '/orders/[id]', params: { id: order.id, placed: '1' } });
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const total = subtotal + shippingFor(subtotal);

  const form = (
    <View style={{ gap: 20 }}>
      <Card style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Icon name="truck-delivery-outline" size={22} color={colors.primary} />
          <Text variant="heading">Delivery details</Text>
        </View>
        <TextField
          label="Full name"
          value={fullName}
          onChangeText={setFullName}
          error={errors.fullName}
          autoComplete="name"
        />
        <TextField
          label="Address"
          placeholder="Street and number"
          value={line1}
          onChangeText={setLine1}
          error={errors.line1}
          autoComplete="street-address"
        />
        <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 16 }}>
          <View style={{ flex: 1 }}>
            <TextField label="City" value={city} onChangeText={setCity} error={errors.city} />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              error={errors.phone}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>
        </View>
      </Card>
      <Card style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Icon name="credit-card-outline" size={22} color={colors.primary} />
          <Text variant="heading" style={{ flex: 1 }}>
            Payment
          </Text>
          {IS_DEMO ? <Badge label="Demo" tone="warning" icon="flask-outline" /> : null}
        </View>
        {IS_DEMO ? (
          <View
            style={{
              padding: 16,
              borderRadius: radius.lg,
              backgroundColor: colors.surfaceMuted,
              gap: 10,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text variant="subheading">•••• •••• •••• 4242</Text>
              <Icon name="credit-card-chip-outline" size={24} color={colors.textMuted} />
            </View>
            <Text variant="caption" tone="muted">
              Demo mode uses a simulated test card — no real payment is taken.
            </Text>
          </View>
        ) : (
          <Text variant="callout" tone="muted">
            {payment.supportsCardPayments
              ? 'You will confirm payment securely with Stripe. Apple Pay and Google Pay are supported where available.'
              : 'Your order will be confirmed once payment is verified.'}
          </Text>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name="lock-outline" size={16} color={colors.success} />
          <Text variant="caption" tone="success">
            Payments are encrypted and processed securely.
          </Text>
        </View>
      </Card>
    </View>
  );

  const summary = (
    <Card style={{ gap: 16 }}>
      <Text variant="heading">Order summary</Text>
      {lines.map((l) => (
        <View
          key={l.product.id}
          style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}
        >
          <Text variant="callout" style={{ flex: 1 }} numberOfLines={1}>
            {l.quantity} × {l.product.name}
          </Text>
          <Text variant="callout">{formatMoney(l.product.priceCents * l.quantity)}</Text>
        </View>
      ))}
      <View style={{ height: 1, backgroundColor: colors.border }} />
      <OrderSummary subtotal={subtotal} />
      {isWide ? (
        <Button
          label={`Pay ${formatMoney(total)}`}
          icon="lock-outline"
          size="lg"
          loading={busy}
          onPress={placeOrder}
        />
      ) : null}
    </Card>
  );

  return (
    <Screen
      header={header}
      footer={
        isWide ? undefined : (
          <Button
            label={`Pay ${formatMoney(total)}`}
            icon="lock-outline"
            size="lg"
            loading={busy}
            onPress={placeOrder}
          />
        )
      }
    >
      {isWide ? (
        <View style={{ flexDirection: 'row', gap: 24, alignItems: 'flex-start' }}>
          <View style={{ flex: 1.4 }}>{form}</View>
          <View style={{ flex: 1 }}>{summary}</View>
        </View>
      ) : (
        <>
          {form}
          {summary}
        </>
      )}
    </Screen>
  );
}
