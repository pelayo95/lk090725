// src/contexts/DataContext.jsx
import React, { useContext, createContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useNotification } from './NotificationContext';
import { initialData } from '../data/mockData';
import { uuidv4 } from '../utils/uuid';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const { addToast } = useNotification();
    const [isLoading, setIsLoading] = useState(true);

    const [holidays, setHolidays] = useLocalStorage('holidays', initialData.holidays);
    const [companies, setCompanies] = useLocalStorage('companies', initialData.companies);
    const [complaints, setComplaints] = useLocalStorage('complaints', initialData.complaints);
    const [plans, setPlans] = useLocalStorage('plans', initialData.plans);
    const [roles, setRoles] = useLocalStorage('roles', initialData.roles || {});
    const [communicationTemplates, setCommunicationTemplates] = useLocalStorage('communicationTemplates', initialData.communicationTemplates || {});
    const [notificationRules, setNotificationRules] = useLocalStorage('notificationRules', initialData.notificationRules || {}); // Nuevo

    useEffect(() => {
        setIsLoading(false);
    }, []);
    
    // ... (resto de las funciones addComplaint, updateComplaint, etc. sin cambios)

    const value = { 
        companies, setCompanies, 
        complaints, addComplaint, updateComplaint, 
        holidays, setHolidays, 
        updateCompany, 
        plans, setPlans,
        roles, setRoles,
        communicationTemplates, setCommunicationTemplates,
        notificationRules, setNotificationRules // Exportar nuevo estado
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen bg-slate-100 text-slate-600">Cargando datos de la aplicación...</div>;
    }

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
