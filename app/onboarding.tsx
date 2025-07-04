import { Colors } from '@/constants/Colors'; // Renkleri import et
import { useColorScheme } from '@/hooks/useColorScheme'; // Temayı almak için hook
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Contacts from 'expo-contacts';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
const handleContinue = async () => {
  // ... (diğer kontroller)
  try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
          // YENİ: Backend'e kayıt isteği
          const response = await fetch('http://192.168.2.34:3000/api/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phoneNumber }),
          });

          if (!response.ok) {
              throw new Error('Registration failed!');
          }

          const userData = await response.json();

          // Kullanıcı ID'sini ve telefon numarasını sakla
          await AsyncStorage.setItem('user_id', userData.userId);
          await AsyncStorage.setItem('user_phone', phoneNumber);
          await AsyncStorage.setItem('onboarding_complete', 'true');
          
          router.replace('/contacts');
          Alert.alert('welcome to direct--');
      } else {
          Alert.alert('contacts permission required to continue');
      }
  } catch (error) {
      Alert.alert('error occurred. please try again');
  }
};

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const colorScheme = useColorScheme(); // Mevcut temayı al ('light' veya 'dark')

  // ANİMASYON DEĞİŞKENLERİ
  const colorAnim1 = useRef(new Animated.Value(0)).current;
  const colorAnim2 = useRef(new Animated.Value(0)).current;
  const moveAnim1 = useRef(new Animated.Value(0)).current;
  const moveAnim2 = useRef(new Animated.Value(0)).current;

  // ANİMASYON BAŞLATMA - DEĞİŞKEN FREKANSLAR VE BELİRGİN HAREKET
  useEffect(() => {
    const animateBackground = () => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(moveAnim1, { toValue: 1, duration: 6000, useNativeDriver: false }),
            Animated.timing(moveAnim1, { toValue: 0, duration: 10000, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(moveAnim2, { toValue: 1, duration: 14000, useNativeDriver: false }),
            Animated.timing(moveAnim2, { toValue: 0, duration: 7000, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(colorAnim1, { toValue: 1, duration: 11000, useNativeDriver: false }),
            Animated.timing(colorAnim1, { toValue: 0, duration: 13000, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(colorAnim2, { toValue: 1, duration: 9000, useNativeDriver: false }),
            Animated.timing(colorAnim2, { toValue: 0, duration: 16000, useNativeDriver: false }),
          ]),
        ])
      ).start();
    };
    animateBackground();
  }, []);

  const handleLearnStructure = () => {
    Alert.alert(
      'direct-- structure',
      '• give positive feedback to contacts in your phonebook\n• match when mutual feedback occurs\n• you have 1 feedback per week\n• status resets after 2 weeks\n• your feedback remains private until mutual'
    );
  };

  const handleContinue = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('phone number required');
      return;
    }
    if (!consentChecked) {
      Alert.alert('consent required');
      return;
    }
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        await AsyncStorage.setItem('user_phone', phoneNumber);
        await AsyncStorage.setItem('onboarding_complete', 'true');
        router.replace('/contacts');
        Alert.alert('welcome to direct--');
      } else {
        Alert.alert('contacts permission required to continue');
      }
    } catch (error) {
      Alert.alert('error occurred. please try again');
    }
  };

  const backgroundColor1 = colorAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 182, 193, 0.6)', 'rgba(221, 160, 221, 0.6)'],
  });
  const backgroundColor2 = colorAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(152, 251, 152, 0.5)', 'rgba(255, 218, 185, 0.5)'],
  });
  const backgroundColor3 = colorAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(173, 216, 230, 0.55)', 'rgba(175, 238, 238, 0.55)'],
  });
  const translateY1 = moveAnim1.interpolate({ inputRange: [0, 1], outputRange: [0, 80] });
  const translateY2 = moveAnim2.interpolate({ inputRange: [0, 1], outputRange: [0, -60] });
  const translateX1 = moveAnim1.interpolate({ inputRange: [0, 1], outputRange: [0, 40] });
  const translateX2 = moveAnim2.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });

  const themeColors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
        <Animated.View style={[styles.colorBlob, styles.blob1, { backgroundColor: backgroundColor1, transform: [{ translateY: translateY1 }, { translateX: translateX1 }] }]} />
        <Animated.View style={[styles.colorBlob, styles.blob2, { backgroundColor: backgroundColor2, transform: [{ translateY: translateY2 }, { translateX: translateX2 }] }]} />
        <Animated.View style={[styles.colorBlob, styles.blob3, { backgroundColor: backgroundColor3, transform: [{ translateY: translateY1 }, { translateX: translateX1 }, { rotate: '15deg' }] }]} />
        <Animated.View style={[styles.colorBlob, styles.blob4, { backgroundColor: backgroundColor1, transform: [{ translateY: translateY2 }, { translateX: translateX2 }, { rotate: '-10deg' }] }]} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>hi,</Text>
        <Text style={styles.description}>
          it-is-direct--.{'\n'}
          it-is-basically-{'\n'}
          an-catalyst-in-{'\n'}
          your-social-{'\n'}
          life.{'\n'}
          if-you-want-to-{'\n'}
          learn-the-{'\n'}
          structure-
          <Text style={[styles.clickableText, { color: themeColors.accent }]} onPress={handleLearnStructure}>
            click-{'\n'}this.
          </Text>
          {'\n'}
          otherwise-you-{'\n'}
          know-the-deal.
        </Text>
        <Text style={styles.inputLabel}>
          your-phone-{'\n'}
          number-(please):
        </Text>
        <TextInput
          style={styles.phoneInput}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder=""
          keyboardType="phone-pad"
          placeholderTextColor="#ccc"
        />
        <Text style={styles.consentLabel}>
          and-consent-to-{'\n'}
          share-your-{'\n'}
          contacts:
        </Text>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setConsentChecked(!consentChecked)}
        >
          <View style={[styles.checkbox, consentChecked && [styles.checkboxChecked, { backgroundColor: themeColors.accent, borderColor: themeColors.accent }]]}>
            {consentChecked && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: themeColors.buttonPrimary }]}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  backgroundContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' },
  colorBlob: { position: 'absolute', borderRadius: width * 2 },
  blob1: { width: width * 2, height: height * 0.7, top: -height * 0.25, left: -width * 0.4 },
  blob2: { width: width * 1.6, height: height * 0.6, top: height * 0.35, right: -width * 0.3 },
  blob3: { width: width * 1.3, height: height * 0.5, top: height * 0.15, left: width * 0.05 },
  blob4: { width: width * 1.8, height: height * 0.8, top: height * 0.45, left: -width * 0.3 },
  content: { flexGrow: 1, paddingHorizontal: 30, paddingVertical: 50, justifyContent: 'center', zIndex: 1 },
  greeting: { fontSize: 24, color: '#333', fontFamily: 'Courier New', marginBottom: 40, fontWeight: '400' },
  description: { fontSize: 18, color: '#333', fontFamily: 'Courier New', lineHeight: 24, marginBottom: 50, fontWeight: '400' },
  clickableText: { textDecorationLine: 'underline' },
  inputLabel: { fontSize: 16, color: '#333', fontFamily: 'Courier New', marginBottom: 15, fontWeight: '400' },
  phoneInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, fontFamily: 'Courier New', backgroundColor: 'rgba(255, 255, 255, 0.9)', marginBottom: 40, color: '#333' },
  consentLabel: { fontSize: 16, color: '#333', fontFamily: 'Courier New', marginBottom: 15, fontWeight: '400' },
  checkboxContainer: { marginBottom: 60, alignSelf: 'flex-start' },
  checkbox: { width: 30, height: 30, borderWidth: 2, borderColor: '#ddd', borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.9)', justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: {},
  checkmark: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  continueButton: { paddingVertical: 15, paddingHorizontal: 40, borderRadius: 8, alignSelf: 'flex-start' },
  continueButtonText: { color: 'white', fontSize: 16, fontFamily: 'Courier New', fontWeight: '400' },
});