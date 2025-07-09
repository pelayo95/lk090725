// src/AppWrapper.js
import React from 'react';
import { NotificationProvider } from './contexts/NotificationContext';
import { DataProvider } from './contexts/DataContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';

/**
 * Wraps the main App component with all necessary context providers.
 * This keeps the main App component clean and focused on routing.
 */
export default function AppWrapper() {
  return (
    <NotificationProvider>
        <DataProvider>
            <ConfigProvider>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </ConfigProvider>
        </DataProvider>
    </NotificationProvider>
  );
}
