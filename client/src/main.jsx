import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import authReducer from "./state"; // Ensure this reducer handles user info
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from "react-redux";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from "redux-persist";
import storage from 'redux-persist/lib/storage';
import { PersistGate } from 'redux-persist/integration/react';
import './index.css';

// Persist configuration
const persistConfig = {
  key: "root",
  storage,
  version: 1
};

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, authReducer);

// Create the Redux store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoreActions: [FLUSH, REGISTER, REHYDRATE, PAUSE, PERSIST, PURGE],
      },
    }),
});

// Create a persistor
const persistor = persistStore(store);

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </BrowserRouter>,
);
