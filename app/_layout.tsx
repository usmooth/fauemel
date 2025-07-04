import { persistor, store } from '@/store/store';
import { Stack } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

export default function RootLayout() {
  return (
    // Provider ve PersistGate artık tüm uygulamayı burada sarmalıyor
    <Provider store={store}>
      <PersistGate loading={<ActivityIndicator />} persistor={persistor}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Burada tüm ana ekranlarımızı ve navigator'larımızı tanımlıyoruz.
            headerShown: false diyerek her ekranın kendi başlığını yönetmesine izin veriyoruz.
          */}
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="notifications" />
        </Stack>
      </PersistGate>
    </Provider>
  );
}