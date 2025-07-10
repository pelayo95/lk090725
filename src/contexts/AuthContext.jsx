// src/contexts/AuthContext.jsx
import React, { useContext, createContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useNotification } from './NotificationContext';
import { useData } from './DataContext'; // Importar useData
import { initialData } from '../data/mockData';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const { addToast } = useNotification();
    const { roles } = useData(); // Obtener los roles del DataContext
    const [user, setUser] = useLocalStorage('user', null);
    const [allUsers, setAllUsers] = useLocalStorage('users', initialData.users);

    const login = (email, password) => {
        const foundUser = allUsers.find(u => u.email === email && u.password === password);
        if (!foundUser) {
            addToast('Credenciales inválidas', 'error');
            return null;
        }

        // Enriquecer el objeto de usuario con sus permisos
        let userPermissions = {};
        if (foundUser.roleId === 'boss_role') {
            // Lógica especial para el Super Admin si es necesario
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
            // Si se actualiza el rol, los permisos también deben actualizarse
            // Esta lógica se podría expandir si se permite cambiar el rol de un usuario logueado.
            setUser(prev => ({...prev, ...updates}));
        }
    }

    const value = { user, login, logout, allUsers, setAllUsers, updateUser };
    
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
