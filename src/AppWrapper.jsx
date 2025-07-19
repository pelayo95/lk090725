// src/AppWrapper.js
import React from 'react';
import { NotificationProvider } from './contexts/NotificationContext';
import { DataProvider } from './contexts/DataContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { AuthProvider } from './contexts/AuthContext';
import { TemplateSuggestionProvider } from './contexts/TemplateSuggestionContext';
import App from './App';

export default function AppWrapper() {
  return (
    <NotificationProvider>
        <DataProvider>
            <TemplateSuggestionProvider>
                <ConfigProvider>
                    <AuthProvider>
                        <App />
                    </AuthProvider>
                </ConfigProvider>
            </TemplateSuggestionProvider>
        </DataProvider>
    </NotificationProvider>
  );
}
