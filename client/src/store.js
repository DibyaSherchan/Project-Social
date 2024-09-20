import { configureStore } from '@reduxjs/toolkit';
import authReducer from './state';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});