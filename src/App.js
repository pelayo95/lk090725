// src/App.js
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './contexts/AuthContext';
import PublicPortal from './pages/public/PublicPortal';
import AdminPortal from './pages/admin/AdminPortal';
import BossPortal from './pages/boss/BossPortal';
import LoginScreen from './pages/LoginScreen';

/**
 * Main application component responsible for routing.
 * It determines which portal to render based on the URL hash and user authentication status.
 */
function App() {
    const [hash, setHash] = useState(window.location.hash);
    const { user } = useAuth();

    useEffect(() => {
        const handleHashChange = () => setHash(window.location.hash || '#public');
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Set initial hash
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);
    
    const RenderedPortal = useMemo(() => {
        const portal = hash.split('/')[0] || '#public';
        
        if (user) {
            if (user.role === 'boss' && portal !== '#boss') {
                window.location.hash = '#boss/dashboard';
                return <BossPortal />;
            }
            if ((user.role === 'admin' || user.role === 'investigador') && portal !== '#admin') {
                window.location.hash = '#admin';
                return <AdminPortal />;
            }
        }

        switch (portal) {
            case '#admin':
                return user ? <AdminPortal /> : <LoginScreen />;
            case '#boss':
                return user && user.role === 'boss' ? <BossPortal /> : <LoginScreen />;
            case '#public':
            default:
                return <PublicPortal />;
        }
    }, [hash, user]);

    return RenderedPortal;
}

export default App;
