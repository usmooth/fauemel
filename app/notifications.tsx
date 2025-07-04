import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
// --- DÜZELTİLEN YOLLAR ---
import {
  clearAllNotifications,
  deleteNotification,
  markAsRead,
} from '@/store/slices/notificationsSlice';
import { RootState } from '@/store/store';

export default function NotificationsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const notifications = useSelector((state: RootState) => state.notifications.items);

  const handleMarkAsRead = (notificationId: string) => {
    dispatch(markAsRead(notificationId));
  };

  const handleDeleteNotification = (notificationId: string) => {
    Alert.alert('delete notification', 'are you sure?', [
      { text: 'cancel', style: 'cancel' },
      { text: 'delete', onPress: () => dispatch(deleteNotification(notificationId)) },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert('clear all notifications', 'delete all notifications?', [
      { text: 'cancel', style: 'cancel' },
      { text: 'clear all', onPress: () => dispatch(clearAllNotifications()) },
    ]);
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearText}>clear</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {unreadCount > 0 && (
        <View style={styles.unreadCounter}>
          <Text style={styles.unreadCounterText}>{unreadCount} unread</Text>
        </View>
      )}

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>nothing.</Text>
        </View>
      ) : (
        <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
          {notifications
            .slice()
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}
                onPress={() => handleMarkAsRead(item.id)}
                onLongPress={() => handleDeleteNotification(item.id)}
              >
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>
                    {!item.isRead && '• '}{item.title}
                  </Text>
                  <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
                </View>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                {item.contactName && (
                  <Text style={styles.contactName}>contact: {item.contactName}</Text>
                )}
              </TouchableOpacity>
            ))}
        </ScrollView>
      )}
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>long-press-to-delete-notification</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#000000' },
    backButton: { width: 40 },
    backText: { fontSize: 20, color: '#000000', fontFamily: 'Courier New' },
    title: { fontSize: 18, color: '#000000', fontFamily: 'Courier New', fontWeight: 'bold' },
    clearText: { fontSize: 14, color: '#000000', fontFamily: 'Courier New', textDecorationLine: 'underline' },
    unreadCounter: { paddingHorizontal: 20, paddingVertical: 10 },
    unreadCounterText: { fontSize: 14, color: '#000000', fontFamily: 'Courier New' },
    notificationsList: { flex: 1, paddingHorizontal: 20 },
    notificationItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eeeeee' },
    unreadNotification: { backgroundColor: '#f8f8f8', marginHorizontal: -10, paddingHorizontal: 10, borderRadius: 4 },
    notificationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
    notificationTitle: { fontSize: 16, color: '#000000', fontFamily: 'Courier New', fontWeight: 'bold', flex: 1, marginRight: 10 },
    timestamp: { fontSize: 12, color: '#666666', fontFamily: 'Courier New' },
    notificationMessage: { fontSize: 14, color: '#000000', fontFamily: 'Courier New', lineHeight: 20, marginBottom: 5 },
    contactName: { fontSize: 12, color: '#666666', fontFamily: 'Courier New', fontStyle: 'italic' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    emptyText: { fontSize: 16, color: '#666666', fontFamily: 'Courier New', textAlign: 'center', lineHeight: 24 },
    infoContainer: { paddingHorizontal: 20, paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#000000' },
    infoText: { fontSize: 12, color: '#666666', fontFamily: 'Courier New', textAlign: 'center', fontStyle: 'italic' },
});