// src/contexts/AuthContext.js
import React, { useContext, createContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useNotification } from './NotificationContext';
import { initialData } from '../data/mockData';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const { addToast } = useNotification();
    const [user, setUser] = useLocalStorage('user', null);
    const [allUsers, setAllUsers] = useLocalStorage('users', initialData.users);

    const login = (email, password) => {
        const foundUser = allUsers.find(u => u.email === email && u.password === password);
        if (!foundUser) {
            addToast('Credenciales inválidas', 'error');
            return null;
        }
        
        setUser(foundUser);
        addToast(`Bienvenido, ${foundUser.name}`, 'success');
        return foundUser;
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
    
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
