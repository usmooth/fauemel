import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface Notification {
  id: string;
  type: 'match' | 'info';
  title: string;
  message: string;
  contactName: string;
  timestamp: number;
  isRead: boolean;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const savedNotifications = await AsyncStorage.getItem('app_notifications');
      if (savedNotifications) {
        const parsedNotifications = JSON.parse(savedNotifications);
        setNotifications(parsedNotifications);
      } else {
        // Default welcome notification
        const defaultNotifications = [
          {
            id: '1',
            type: 'info',
            title: 'welcome to direct--',
            message: 'you can now give positive feedback to contacts in your phonebook. mutual feedback creates matches.',
            contactName: '',
            timestamp: Date.now() - 60000,
            isRead: false,
          }
        ];
        setNotifications(defaultNotifications);
        await saveNotifications(defaultNotifications);
      }
    } catch (error) {
      console.error('error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNotifications = async (notificationsList: Notification[]) => {
    try {
      await AsyncStorage.setItem('app_notifications', JSON.stringify(notificationsList));
    } catch (error) {
      console.error('error saving notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId 
        ? { ...notification, isRead: true }
        : notification
    );
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  };

  const deleteNotification = async (notificationId: string) => {
    Alert.alert(
      'delete notification',
      'are you sure?',
      [
        { text: 'cancel', style: 'cancel' },
        {
          text: 'delete',
          onPress: async () => {
            const filteredNotifications = notifications.filter(n => n.id !== notificationId);
            setNotifications(filteredNotifications);
            await saveNotifications(filteredNotifications);
          }
        }
      ]
    );
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'clear all notifications',
      'delete all notifications?',
      [
        { text: 'cancel', style: 'cancel' },
        {
          text: 'clear all',
          onPress: async () => {
            setNotifications([]);
            await saveNotifications([]);
          }
        }
      ]
    );
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        !item.isRead && styles.unreadNotification
      ]}
      onPress={() => markAsRead(item.id)}
      onLongPress={() => deleteNotification(item.id)}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>
          {!item.isRead && '• '}{item.title}
        </Text>
        <Text style={styles.timestamp}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
      
      <Text style={styles.notificationMessage}>
        {item.message}
      </Text>
      
      {item.contactName && (
        <Text style={styles.contactName}>
          contact: {item.contactName}
        </Text>
      )}
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>notifications</Text>
        
        {notifications.length > 0 && (
          <TouchableOpacity 
            onPress={clearAllNotifications}
          >
            <Text style={styles.clearText}>clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Unread Counter */}
      {unreadCount > 0 && (
        <View style={styles.unreadCounter}>
          <Text style={styles.unreadCounterText}>
            {unreadCount} unread
          </Text>
        </View>
      )}

      {/* Content */}
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            nothing.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
          {notifications
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((notification) => (
              <View key={notification.id}>
                {renderNotification({ item: notification })}
              </View>
            ))}
        </ScrollView>
      )}

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          long-press-to-delete-notification
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'Courier New',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  backButton: {
    width: 40,
  },
  backText: {
    fontSize: 20,
    color: '#000000',
    fontFamily: 'Courier New',
  },
  title: {
    fontSize: 18,
    color: '#000000',
    fontFamily: 'Courier New',
    fontWeight: 'bold',
  },
  clearText: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Courier New',
    textDecorationLine: 'underline',
  },
  unreadCounter: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  unreadCounterText: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Courier New',
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  notificationItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  unreadNotification: {
    backgroundColor: '#f8f8f8',
    marginHorizontal: -10,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  notificationTitle: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'Courier New',
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  timestamp: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Courier New',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Courier New',
    lineHeight: 20,
    marginBottom: 5,
  },
  contactName: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Courier New',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Courier New',
    textAlign: 'center',
    lineHeight: 24,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#000000',
  },
  infoText: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Courier New',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});