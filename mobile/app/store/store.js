// app/store/store.js
// Updated Redux Store with Mode Management
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import existing reducers
import userReducer from "./slices/userSlice";
import splashReducer from "./slices/splashSlice";
import vehicleReducer from "./slices/vehicleSlice";
import bookingReducer from "./slices/bookingSlice";
import authReducer from "./slices/authSlice";

// Import new mode reducer
import modeReducer from "./slices/modeSlice";

// Persist config
const persistConfig = {
  key: "root",
  version: 3, // Incremented version for new structure
  storage: AsyncStorage,
  whitelist: ["user", "splash", "bookings", "mode"], // Persist user, splash, bookings, and mode
  blacklist: ["vehicles"], // Don't persist vehicles (fetch fresh)
};

// Root reducer
const rootReducer = combineReducers({
  user: userReducer,
  auth: authReducer,
  splash: splashReducer,
  vehicles: vehicleReducer,
  bookings: bookingReducer,
  mode: modeReducer, // ← MODE SLICE ADDED
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);