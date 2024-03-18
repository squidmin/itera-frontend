// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import chatReducer from '../features/chat/chatSlice'; // You will create this slice next

export const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
