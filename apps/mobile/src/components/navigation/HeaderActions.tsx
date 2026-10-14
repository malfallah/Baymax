import { router } from 'expo-router';
import { Pressable } from 'react-native';
import { useLayout } from '@/hooks/useLayout';
import { useAuth } from '@/stores/auth';
import { cartCount, useCart } from '@/stores/cart';
import { Avatar, IconButton } from '../ui';

/** Cart + profile shortcuts shown at the top of tab screens on phones. */
export function HeaderActions({ cart = true }: { cart?: boolean }) {
  const user = useAuth((s) => s.user);
  const items = useCart((s) => cartCount(s.lines));
  const { isWide } = useLayout();
  if (!user) return null;
  return (
    <>
      {cart && user.role === 'patient' ? (
        <IconButton
          icon="cart-outline"
          label="Open cart"
          badge={items}
          onPress={() => router.push('/cart')}
        />
      ) : null}
      {!isWide ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={() => router.push('/profile')}
        >
          <Avatar name={user.fullName} color={user.avatarColor} size={40} />
        </Pressable>
      ) : null}
    </>
  );
}
