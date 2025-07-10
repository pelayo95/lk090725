// src/App.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './contexts/AuthContext';
import PublicPortal from './pages/public/PublicPortal';
import AdminPortal from './pages/admin/AdminPortal';
import BossPortal from './pages/boss/BossPortal';
import LoginScreen from './pages/LoginScreen';

/**
 * Componente principal de la aplicación, responsable del enrutamiento.
 * Determina qué portal renderizar basado en el hash de la URL y el estado de autenticación del usuario.
 */
function App() {
    const [hash, setHash] = useState(window.location.hash);
    const { user } = useAuth(); // El objeto 'user' ahora contiene el objeto 'permissions'

    useEffect(() => {
        const handleHashChange = () => setHash(window.location.hash || '#public');
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Establecer el hash inicial
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);
    
    const RenderedPortal = useMemo(() => {
        const portal = hash.split('/')[0] || '#public';
        
        // Si hay un usuario logueado y sus permisos están cargados
        if (user && user.permissions) {
            // Si el usuario es el "Boss"
            if (user.permissions.isBoss) {
                // Si no está en el portal del boss, redirigir
                if (portal !== '#boss') {
                    window.location.hash = '#boss/dashboard';
                    return null; // Renderizar nada mientras se redirige
                }
                return <BossPortal />;
            } 
            // Para cualquier otro usuario autenticado (Admin, Investigador, etc.)
            else {
                // Si no está en el portal de admin, redirigir
                if (portal !== '#admin') {
                     window.location.hash = '#admin';
                     return null; // Renderizar nada mientras se redirige
                }
                return <AdminPortal />;
            }
        }

        // Si no hay usuario, manejar rutas públicas y de login
        switch (portal) {
            case '#admin':
            case '#boss':
                return <LoginScreen />;
            case '#public':
            default:
                return <PublicPortal />;
        }
    }, [hash, user]);

    return RenderedPortal;
}

export default App;
