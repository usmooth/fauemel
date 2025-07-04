import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API'den gelecek bildirim verisinin yapısı
interface Notification {
  _id: string; // MongoDB _id'sini alacağız
  id: string; // React için key olarak kullanmak üzere
  type: 'match' | 'info';
  title: string;
  message: string;
  contactName: string;
  timestamp: number;
  isRead: boolean;
  createdAt: string; // sunucudan gelen tarih
}

// State'imizin yapısı
interface NotificationsState {
  items: Notification[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed'; // API istek durumunu takip etmek için
  error: string | null;
}

// YENİ: Bildirimleri sunucudan çeken asenkron thunk
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (userId: string, { rejectWithValue }) => {
    try {
      // Backend'deki yeni endpoint'imize istek atıyoruz
      // NOT: 'http://localhost:3000' adresini kendi IP adresinle değiştirmen gerekebilir
      const response = await fetch('http://192.168.2.34:3000/api/register${userId}`);
      if (!response.ok) {
        throw new Error('Server error!');
      }
      const data: Notification[] = await response.json();
      // Gelen _id'yi id olarak kopyalayalım, çünkü slice'ımız id kullanıyor
      return data.map(n => ({ ...n, id: n._id, timestamp: new Date(n.createdAt).getTime() }));
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


// Başlangıç durumu
const initialState: NotificationsState = {
  items: [], // Artık başlangıçta boş olacak, sunucudan dolduracağız
  status: 'idle',
  error: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Diğer reducer'lar (markAsRead, deleteNotification, vs.) aynı kalabilir.
    // Sadece addNotification'ı backend'den gelen veriyle uyumlu hale getirelim.
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload);
    },
     markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.items.find(item => item.id === action.payload);
      if (notification) {
        notification.isRead = true;
      }
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.items = [];
    },
  },
  // Asenkron thunk'ların sonuçlarını burada işliyoruz
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { addNotification, markAsRead, deleteNotification, clearAllNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;