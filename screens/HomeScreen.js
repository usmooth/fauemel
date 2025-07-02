import React from 'react';
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function HomeScreen({ navigation }) {
  const handleContactsAccess = () => {
    Alert.alert(
      'Rehber Erişimi',
      'Telefon rehberinize erişim istiyoruz',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'İzin Ver', 
          onPress: () => navigation.navigate('Contacts')
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Ana İçerik */}
      <View style={styles.content}>
        <Text style={styles.title}>direct-</Text>
        <Text style={styles.subtitle}>not a dating app</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Nasıl Çalışır?</Text>
          <Text style={styles.infoText}>
            • Rehberinizdeki kişilere olumlu dönüt verin{'\n'}
            • Karşılıklı dönüt varsa eşleşin{'\n'}
            • Haftalık 1 dönüt hakkınız var{'\n'}
            • 2 hafta sonra durumlar sıfırlanır
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleContactsAccess}
        >
          <Text style={styles.startButtonText}>Başla</Text>
        </TouchableOpacity>
      </View>

      {/* Google Ads Banner - Ana sayfanın 1/10'u */}
      <View style={styles.adBanner}>
        <Text style={styles.adText}>📱 Reklam Alanı</Text>
        <Text style={styles.adSubtext}>Google Ads Banner</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 9, // Ana içerik 9/10
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#6200ea',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#6200ea',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    shadowColor: '#6200ea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  adBanner: {
    flex: 1, // Banner 1/10
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  adText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  adSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});