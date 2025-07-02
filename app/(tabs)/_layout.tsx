import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6200ea',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false, // Loading sayfası
        }} 
      />
      <Stack.Screen 
        name="onboarding" 
        options={{ 
          title: 'direct-',
          headerShown: false, // Onboarding sayfasında header gizli
        }} 
      />
      <Stack.Screen 
        name="contacts" 
        options={{ 
          title: 'direct-',
          headerShown: false, // Ana sayfada header gizli (kendi header'ı var)
        }} 
      />
      <Stack.Screen 
        name="notifications" 
        options={{ 
          title: 'Bildirimler',
          headerShown: false, // Kendi header'ı var
        }} 
      />
    </Stack>
  );
}
