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
        
        // Primero, manejamos el caso de un usuario no autenticado o en proceso de carga.
        if (!user || !user.permissions) {
            if (portal === '#admin' || portal === '#boss') {
                return <LoginScreen />;
            }
            // Para cualquier otra ruta, mostramos el portal público.
            return <PublicPortal />;
        }

        // Si llegamos aquí, el usuario está logueado y sus permisos están cargados.
        
        // Caso 1: El usuario es el "Boss".
        if (user.permissions.isBoss) {
            // Si no está en la URL correcta, lo redirigimos.
            if (portal !== '#boss') {
                window.location.hash = '#boss/dashboard';
                return null; // No renderizar nada mientras se redirige.
            }
            // Si está en la URL correcta, mostramos su portal.
            return <BossPortal />;
        }
        
        // Caso 2: El usuario es un Admin/Investigador de una empresa.
        if (!user.permissions.isBoss) {
            // Si no está en la URL correcta, lo redirigimos.
            if (portal !== '#admin') {
                 window.location.hash = '#admin';
                 return null; // No renderizar nada mientras se redirige.
            }
            // Si está en la URL correcta, mostramos su portal.
            return <AdminPortal />;
        }

        // Como último recurso, si ninguna condición se cumple, mostramos el portal público.
        return <PublicPortal />;

    }, [hash, user]);

    return RenderedPortal;
}

export default App;
