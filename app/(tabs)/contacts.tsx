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
  
  // Basılı tutma animasyonu için
  const pressProgress = useRef(new Animated.Value(0)).current;
  const pressTimeout = useRef<NodeJS.Timeout | null>(null);

  // Rastgele renkler
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
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

  const findExactMatch = (inputName: string) => {
    if (!inputName.trim()) return null;
    
    const exactMatches = contacts.filter(contact => 
      contact.name.toLowerCase() === inputName.toLowerCase().trim()
    );
    
    return exactMatches;
  };

  const handlePressIn = () => {
    const trimmedText = searchText.trim();
    
    if (!trimmedText) {
      Alert.alert('contact name required');
      return;
    }

    const matches = findExactMatch(trimmedText);
    
    if (!matches || matches.length === 0) {
      Alert.alert('contact not found', 'make sure you type the exact name as saved in your phonebook');
      return;
    }
    
    if (matches.length > 1) {
      Alert.alert('multiple contacts found', 'you have multiple contacts with this name. please make names unique');
      return;
    }

    if (weeklyFeedbackCount >= 1) {
      Alert.alert('weekly limit reached', 'you have used your 1 feedback this week');
      return;
    }

    // Rastgele renk seç
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setCurrentColor(randomColor);
    
    setIsPressed(true);
    
    // 5 saniye animasyon başlat - TAM 5 SANİYE
    Animated.timing(pressProgress, {
      toValue: 1,
      duration: 5000, // Tam 5 saniye
      useNativeDriver: false,
    }).start();

    // 5 saniye sonra dönüt ver
    pressTimeout.current = setTimeout(() => {
      giveFeedback(matches[0]);
    }, 5000);
  };

  const handlePressOut = () => {
    setIsPressed(false);
    pressProgress.setValue(0);
    
    if (pressTimeout.current) {
      clearTimeout(pressTimeout.current);
      pressTimeout.current = null;
    }
  };

  const giveFeedback = async (contact: Contact) => {
    setWeeklyFeedbackCount(prev => prev + 1);
    setIsPressed(false);
    pressProgress.setValue(0);
    
    // %30 ihtimalle eşleşme simüle et
    const isMatch = Math.random() < 0.3;
    
    if (isMatch) {
      await addMatchNotification(contact.name);
      Alert.alert('feedback sent', `positive feedback sent to ${contact.name}. waiting for mutual feedback...`);
    } else {
      Alert.alert('feedback sent', `positive feedback sent to ${contact.name}. waiting for mutual feedback...`);
    }
    
    // Arama kutusunu temizle
    setSearchText('');
  };

  const addMatchNotification = async (contactName: string) => {
    try {
      const savedNotifications = await AsyncStorage.getItem('app_notifications');
      const notifications = savedNotifications ? JSON.parse(savedNotifications) : [];
      
      const newNotification = {
        id: Date.now().toString(),
        type: 'match',
        title: 'new!',
        message: `mutual-positive-feedback-!-you-can-now-access-contact-information.`,
        contactName: contactName,
        timestamp: Date.now(),
        isRead: false,
      };
      
      notifications.unshift(newNotification);
      await AsyncStorage.setItem('app_notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('error adding notification:', error);
    }
  };

  // Progress bar genişliği
  const progressWidth = pressProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Bildirim İkonu - Sağ Üst - ÇİZİM TARZI */}
      <TouchableOpacity 
        style={styles.notificationIcon}
        onPress={() => router.push('/notifications')}
      >
        <View style={styles.mailIconContainer}>
          {/* Ana çerçeve */}
          <View style={styles.mailFrame} />
          
          {/* Sol çapraz çizgi (V şeklinin sol tarafı) */}
          <View style={styles.leftDiagonal} />
          
          {/* Sağ çapraz çizgi (V şeklinin sağ tarafı) */}
          <View style={styles.rightDiagonal} />
        </View>
      </TouchableOpacity>

      {/* Ana İçerik - Orta */}
      <View style={styles.centerContent}>
        
        {/* Açıklama Metni - İNGİLİZCE */}
        <Text style={styles.instructionText}>
          type-your-desired-contact-{'\n'}
          as-saved-in-your-phonebook-{'\n'}
          (please).
        </Text>

        {/* Arama Kutusu */}
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder=""
          placeholderTextColor="#ccc"
          autoCorrect={false}
          autoCapitalize="none"
        />

        {/* Dönüt Butonu */}
        <View style={styles.feedbackContainer}>
          <Pressable
            style={styles.feedbackButton}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            delayLongPress={0}
          >
            {/* SABİT YAZI - DEĞİŞMEZ */}
            <Text style={styles.feedbackText}>
              give-positive-feedback
            </Text>
            
            {/* Progress Bar */}
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
        </View>

        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  notificationIcon: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
  },
  mailIconContainer: {
    width: 20,
    height: 16,
    position: 'relative',
  },
  mailFrame: {
    width: 20,
    height: 16,
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  leftDiagonal: {
    width: 12,
    height: 0,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    position: 'absolute',
    top: 3,
    left: 0,
    transform: [{ rotate: '40deg' }],
  },
  rightDiagonal: {
    width: 12,
    height: 0,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    position: 'absolute',
    top: 3,
    right: 0,
    transform: [{ rotate: '-40deg' }],
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  instructionText: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'Courier New',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  searchInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Courier New',
    backgroundColor: '#ffffff',
    color: '#000000',
    marginBottom: 30,
  },
  feedbackContainer: {
    width: '100%',
    backgroundColor: 'transparent',
    marginBottom: 20,
  },
  feedbackButton: {
    position: 'relative',
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  feedbackText: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'Courier New',
    textAlign: 'center',
    zIndex: 2,
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    opacity: 0.3,
    zIndex: 1,
  },
  weeklyCounter: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Courier New',
    textAlign: 'center',
    marginTop: 20,
  },
});