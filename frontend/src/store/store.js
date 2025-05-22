import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'

// Load state from localStorage
const preloadedState = {
  user: {
    user: JSON.parse(localStorage.getItem('user')) || null
  }
};

// Create store with middleware
export const store = configureStore({
  reducer: {
    user: userReducer
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false // Disable serializable check if needed
    }),
  devTools: process.env.NODE_ENV !== 'production'
});

// Subscribe to store changes to save to localStorage
store.subscribe(() => {
  const state = store.getState();
  localStorage.setItem('user', JSON.stringify(state.user.user));
});

export default store;