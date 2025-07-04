import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Contacts from 'expo-contacts';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function IndexScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkInitialSetup();
  }, []);

  const checkInitialSetup = async () => {
    try {
      // Onboarding tamamlandı mı kontrol et
      const onboardingComplete = await AsyncStorage.getItem('onboarding_complete');
      
      if (onboardingComplete === 'true') {
        // Onboarding tamamlandı, contacts izni var mı kontrol et
        const { status } = await Contacts.getPermissionsAsync();
        
        if (status === 'granted') {
          // İzin var, direkt contacts sayfasına git
          router.replace('/contacts');
        } else {
          // İzin yok, onboarding'e gönder
          router.replace('/onboarding');
        }
      } else {
        // İlk açılış, onboarding'e git
        router.replace('/onboarding');
      }
    } catch (error) {
      // Hata varsa onboarding'e git
      router.replace('/onboarding');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200ea" />
        <Text style={styles.loadingText}>direct- yükleniyor...</Text>
      </View>
    );
  }

  // Bu return asla çalışmayacak çünkü hep yönlendirme yapıyoruz
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
});