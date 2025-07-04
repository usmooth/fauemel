import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import notificationsReducer from './slices/notificationsSlice';

// persist için yapılandırma objesi
const persistConfig = {
  key: 'root', // anahtar
  storage: AsyncStorage, // depolama alanı olarak AsyncStorage'ı kullan
  whitelist: ['notifications'] // sadece 'notifications' slice'ını kaydet
};

// Reducer'larımızı birleştiriyoruz
const rootReducer = combineReducers({
  notifications: notificationsReducer,
});

// Reducer'ımızı persist özellikleri ile sarmalıyoruz
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store'umuzu yapılandırıyoruz
export const store = configureStore({
  reducer: persistedReducer, // artık persist edilmiş reducer'ı kullanıyoruz
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // redux-persist'in kullandığı non-serializable değerler için hatayı engelle
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Persistor'ı oluşturup dışa aktarıyoruz
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;