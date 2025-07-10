// src/contexts/AuthContext.jsx
import React, { useContext, createContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useNotification } from './NotificationContext';
import { useData } from './DataContext';
import { initialData } from '../data/mockData';
import { allPermissions } from '../data/permissions';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Helper para generar todos los permisos para el rol de "Boss"
const generateAllBossPermissions = () => {
    return Object.keys(allPermissions).reduce((acc, key) => {
      if (key.includes('_alcance')) {
        acc[key] = key.includes('agenda') ? 'empresa' : 'todos';
      } else {
        acc[key] = true;
      }
      return acc;
    }, {});
};

const allBossPermissions = generateAllBossPermissions();

export const AuthProvider = ({ children }) => {
    const { addToast } = useNotification();
    const { roles } = useData(); 
    
    // `storedUser` es el objeto básico guardado en localStorage
    const [storedUser, setStoredUser] = useLocalStorage('user', null);
    // `currentUser` es el objeto completo y enriquecido que usa la app
    const [currentUser, setCurrentUser] = useState(null);
    // `loading` previene que la app se renderice con datos incompletos
    const [loading, setLoading] = useState(true);

    const [allUsers, setAllUsers] = useLocalStorage('users', initialData.users);

    useEffect(() => {
        // Si no hay usuario guardado, terminamos de cargar.
        if (!storedUser) {
            setCurrentUser(null);
            setLoading(false);
            return;
        }

        // Si hay un usuario guardado, esperamos a que los roles estén disponibles.
        if (storedUser && roles) {
            let userPermissions = {};
            if (storedUser.roleId === 'boss_role') {
                userPermissions = { ...allBossPermissions, isBoss: true }; 
            } else if (storedUser.companyId && storedUser.roleId) {
                const companyRoles = roles[storedUser.companyId] || [];
                const userRole = companyRoles.find(r => r.id === storedUser.roleId);
                userPermissions = userRole ? userRole.permissions : {};
            }

            // Creamos el objeto de usuario final y terminamos de cargar.
            setCurrentUser({
                ...storedUser,
                permissions: userPermissions,
            });
            setLoading(false);
        }
    }, [storedUser, roles]);


    const login = (email, password) => {
        const foundUser = allUsers.find(u => u.email === email && u.password === password);
        if (!foundUser) {
            addToast('Credenciales inválidas', 'error');
            return null;
        }
        
        // Al iniciar sesión, solo guardamos el usuario básico.
        // El useEffect se encargará de enriquecerlo y actualizar el estado.
        setStoredUser(foundUser);
        addToast(`Bienvenido, ${foundUser.name}`, 'success');
        return foundUser;
    };
    
    const logout = () => {
        // Al cerrar sesión, limpiamos el usuario guardado.
        // El useEffect se encargará de poner currentUser a null.
        setStoredUser(null);
        addToast('Sesión cerrada correctamente', 'info');
        window.location.hash = '#public';
    };
    
    const updateUser = (userId, updates) => {
        const updatedUsers = allUsers.map(u => u.uid === userId ? {...u, ...updates} : u);
        setAllUsers(updatedUsers);
        if(currentUser && currentUser.uid === userId) {
            // Si actualizamos el usuario actual, lo actualizamos en localStorage
            // para que el useEffect lo vuelva a enriquecer.
            setStoredUser(prev => ({ ...prev, ...updates }));
        }
    }

    const value = { user: currentUser, login, logout, allUsers, setAllUsers, updateUser };
    
    // Mientras carga, mostramos un mensaje para evitar errores.
    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-slate-100 text-slate-600">Iniciando sesión...</div>;
    }
    
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
