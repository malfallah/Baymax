import type { ExpoConfig } from 'expo/config';

/**
 * Set EXPO_PUBLIC_BASE_URL (e.g. "/Baymax") when hosting the web build under a sub-path such as GitHub Pages.
 */
const baseUrl = process.env.EXPO_PUBLIC_BASE_URL ?? '';

const config: ExpoConfig = {
  name: 'Baymax',
  slug: 'baymax',
  scheme: 'baymax',
  version: '2.0.0',
  orientation: 'default',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  description:
    'Your personal healthcare companion — book doctors, check symptoms, order medicine and learn from a trusted community.',
  ios: {
    bundleIdentifier: 'com.itismoe.baymax',
    supportsTablet: true,
    infoPlist: { ITSAppUsesNonExemptEncryption: false },
  },
  android: {
    package: 'com.itismoe.baymax',
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      monochromeImage: './assets/images/adaptive-icon-mono.png',
      backgroundColor: '#2563EB',
    },
  },
  web: {
    output: 'single',
    favicon: './assets/images/favicon.png',
    name: 'Baymax — Your personal healthcare companion',
    shortName: 'Baymax',
    themeColor: '#2563EB',
    backgroundColor: '#F6F7FB',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-font',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 160,
        resizeMode: 'contain',
        backgroundColor: '#F6F7FB',
        dark: { image: './assets/images/splash-icon.png', backgroundColor: '#0B1120' },
      },
    ],
    [
      '@stripe/stripe-react-native',
      { enableGooglePay: true, merchantIdentifier: 'merchant.com.itismoe.baymax' },
    ],
  ],
  experiments: {
    typedRoutes: true,
    baseUrl,
  },
  extra: {
    eas: { projectId: '843282b6-d7cc-4473-8b21-e09df8e53d35' },
  },
};

export default config;
