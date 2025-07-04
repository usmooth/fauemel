import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Contacts from 'expo-contacts';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
// YENİ: Hashing için crypto-js'i import ediyoruz
import SHA256 from 'crypto-js/sha256';

interface Contact {
  id: string;
  name: string;
  phoneNumbers?: Array<{ number: string }>;
  emails?: Array<{ email: string }>;
}

export default function ContactsScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchText, setSearchText] = useState('');
  const [weeklyFeedbackCount, setWeeklyFeedbackCount] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  
  const pressProgress = useRef(new Animated.Value(0)).current;
  const pressTimeout = useRef<NodeJS.Timeout | null>(null);

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
  const [currentColor, setCurrentColor] = useState(colors[0]);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        });
        setContacts(data.filter(contact => contact.name));
      }
    } catch (error) {
      Alert.alert('error loading contacts');
    }
  };
  
  // --- Fonksiyonlar YENİ MANTIK ile güncellendi ---

  // Dönüt verme işleminin tamamı
  const giveFeedback = async (contact: Contact) => {
    setIsPressed(false);
    pressProgress.setValue(0);

    try {
        const fromUserId = await AsyncStorage.getItem('user_id');
        const fromUserPhone = await AsyncStorage.getItem('user_phone');
        
        if (!fromUserId || !fromUserPhone) {
            Alert.alert('Error', 'User information not found. Please restart the app.');
            return;
        }

        // 1. Telefon numaralarını al ve normalleştir (boşluk, tire vs. kaldır)
        const toUserPhone = contact.phoneNumbers?.[0]?.number;
        if (!toUserPhone) {
            Alert.alert('Error', 'Selected contact does not have a phone number.');
            return;
        }
        
        const normalizedFromPhone = fromUserPhone.replace(/\s+/g, '');
        const normalizedToPhone = toUserPhone.replace(/\s+/g, '');

        // 2. Alfabetik olarak sırala ve birleştirerek `pairKey` oluştur
        const phoneNumbers = [normalizedFromPhone, normalizedToPhone].sort();
        const combinedString = phoneNumbers.join('');
        const pairKey = SHA256(combinedString).toString();
        
        // 3. Gönderen kullanıcının hash'ini oluştur
        const fromUserHash = SHA256(normalizedFromPhone).toString();

        // 4. Backend'e HASH'lenmiş veriyi gönder
        const response = await fetch('http://192.168.2.34:3000/api/feedback', { // Kendi IP adresini kullan
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fromUserId,
                pairKey,
                fromUserHash
            }),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || 'Failed to send feedback.');
        }

        // Başarılı olursa dönüt hakkını düşür ve kullanıcıya bilgi ver
        setWeeklyFeedbackCount(prev => prev + 1);
        Alert.alert('Feedback Sent', `Your anonymous positive feedback has been registered.`);

    } catch (error: any) {
        console.error("Feedback error:", error);
        Alert.alert('Error', error.message);
    }
    
    setSearchText('');
  };
  
  // Basılı tutma mekanizması (değişiklik yok)
  const handlePressIn = () => {
    const trimmedText = searchText.trim();
    if (!trimmedText) return Alert.alert('contact name required');
    
    const matches = contacts.filter(contact => contact.name.toLowerCase() === trimmedText.toLowerCase());
    if (matches.length === 0) return Alert.alert('contact not found', 'make sure you type the exact name as saved in your phonebook');
    if (matches.length > 1) return Alert.alert('multiple contacts found', 'please make contact names unique');
    if (weeklyFeedbackCount >= 1) return Alert.alert('weekly limit reached', 'you have used your 1 feedback this week');
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setCurrentColor(randomColor);
    setIsPressed(true);
    
    Animated.timing(pressProgress, { toValue: 1, duration: 5000, useNativeDriver: false }).start();
    pressTimeout.current = setTimeout(() => giveFeedback(matches[0]), 5000);
  };
  
  const handlePressOut = () => {
    setIsPressed(false);
    pressProgress.setValue(0);
    if (pressTimeout.current) {
      clearTimeout(pressTimeout.current);
    }
  };

  const progressWidth = pressProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.notificationIcon}
        onPress={() => router.push('/notifications')}
      >
        <View style={styles.mailIconContainer}>
          <View style={styles.mailFrame} />
          <View style={styles.leftDiagonal} />
          <View style={styles.rightDiagonal} />
        </View>
      </TouchableOpacity>
      <View style={styles.centerContent}>
        <Text style={styles.instructionText}>
          type-your-desired-contact-{'\n'}
          as-saved-in-your-phonebook-{'\n'}
          (please).
        </Text>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder=""
          placeholderTextColor="#ccc"
          autoCorrect={false}
          autoCapitalize="none"
        />
        <View style={styles.feedbackContainer}>
          <Pressable
            style={styles.feedbackButton}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            delayLongPress={0}
          >
            <Text style={styles.feedbackText}>
              give-positive-feedback
            </Text>
            {isPressed && (
              <Animated.View 
                style={[
                  styles.progressBar,
                  { 
                    width: progressWidth,
                    backgroundColor: currentColor,
                  }
                ]} 
              />
            )}
          </Pressable>
          <Text style={styles.holdInstructionText}>
            (hold-for-5-seconds-to-send)
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  notificationIcon: { position: 'absolute', top: 60, right: 20, zIndex: 1 },
  mailIconContainer: { width: 20, height: 16, position: 'relative' },
  mailFrame: { width: 20, height: 16, borderWidth: 2, borderColor: '#000000', backgroundColor: 'transparent', position: 'absolute', top: 0, left: 0 },
  leftDiagonal: { width: 12, height: 0, borderBottomWidth: 2, borderBottomColor: '#000000', position: 'absolute', top: 3, left: 0, transform: [{ rotate: '40deg' }] },
  rightDiagonal: { width: 12, height: 0, borderBottomWidth: 2, borderBottomColor: '#000000', position: 'absolute', top: 3, right: 0, transform: [{ rotate: '-40deg' }] },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  instructionText: { fontSize: 16, color: '#000000', fontFamily: 'Courier New', textAlign: 'center', marginBottom: 40, lineHeight: 22 },
  searchInput: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, fontFamily: 'Courier New', backgroundColor: '#ffffff', color: '#000000', marginBottom: 30 },
  feedbackContainer: { width: '100%', backgroundColor: 'transparent', alignItems: 'center', marginBottom: 20 },
  feedbackButton: { position: 'relative', alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 4, overflow: 'hidden' },
  feedbackText: { fontSize: 16, color: '#000000', fontFamily: 'Courier New', textAlign: 'center', zIndex: 2 },
  progressBar: { position: 'absolute', top: 0, left: 0, height: '100%', opacity: 0.3, zIndex: 1 },
  holdInstructionText: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Courier New',
    marginTop: 8,
  },
});