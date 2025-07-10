// src/contexts/AuthContext.jsx
import React, { useContext, createContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useNotification } from './NotificationContext';
import { useData } from './DataContext';
import { initialData } from '../data/mockData';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const { addToast } = useNotification();
    const { roles } = useData(); 
    const [user, setUser] = useLocalStorage('user', null);
    const [allUsers, setAllUsers] = useLocalStorage('users', initialData.users);

    // Efecto para enriquecer al usuario con permisos al cargar desde localStorage
    useEffect(() => {
        // Si hay un usuario pero no tiene el objeto de permisos, lo enriquecemos.
        // Esto es crucial para cuando la página se recarga.
        if (user && !user.permissions) {
            let userPermissions = {};
            if (user.roleId === 'boss_role') {
                // El Boss tiene todos los permisos implícitos o un set especial
                userPermissions = { isBoss: true }; 
            } else if (user.companyId && user.roleId && roles) {
                const companyRoles = roles[user.companyId] || [];
                const userRole = companyRoles.find(r => r.id === user.roleId);
                userPermissions = userRole ? userRole.permissions : {};
            }

            // Actualizamos el estado del usuario para incluir los permisos
            setUser(prevUser => ({
                ...prevUser,
                permissions: userPermissions,
            }));
        }
    }, [user, roles, setUser]);


    const login = (email, password) => {
        const foundUser = allUsers.find(u => u.email === email && u.password === password);
        if (!foundUser) {
            addToast('Credenciales inválidas', 'error');
            return null;
        }

        let userPermissions = {};
        if (foundUser.roleId === 'boss_role') {
            userPermissions = { isBoss: true };
        } else {
            const companyRoles = roles[foundUser.companyId] || [];
            const userRole = companyRoles.find(r => r.id === foundUser.roleId);
            userPermissions = userRole ? userRole.permissions : {};
        }

        const enrichedUser = {
            ...foundUser,
            permissions: userPermissions
        };
        
        setUser(enrichedUser);
        addToast(`Bienvenido, ${enrichedUser.name}`, 'success');
        return enrichedUser;
    };
    
    const logout = () => {
        setUser(null);
        addToast('Sesión cerrada correctamente', 'info');
        window.location.hash = '#public';
    };
    
    const updateUser = (userId, updates) => {
        const updatedUsers = allUsers.map(u => u.uid === userId ? {...u, ...updates} : u);
        setAllUsers(updatedUsers);
        if(user && user.uid === userId) {
            setUser(prev => ({...prev, ...updates}));
        }
    }

    const value = { user, login, logout, allUsers, setAllUsers, updateUser };
    
    // Prevenimos que la aplicación se renderice hasta que el usuario esté completamente cargado con sus permisos.
    // Esto evita el error de "propiedades de undefined".
    if (user && !user.permissions) {
        return <div className="flex items-center justify-center h-screen">Cargando...</div>;
    }
    
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
