// src/contexts/DataContext.jsx
import React, { useContext, createContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useNotification } from './NotificationContext';
import { initialData } from '../data/mockData';
import { uuidv4 } from '../utils/uuid';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const { addToast } = useNotification();
    const [holidays, setHolidays] = useLocalStorage('holidays', initialData.holidays);
    const [companies, setCompanies] = useLocalStorage('companies', initialData.companies);
    const [complaints, setComplaints] = useLocalStorage('complaints', initialData.complaints);
    const [plans, setPlans] = useLocalStorage('plans', initialData.plans);
    // Nuevo estado para gestionar los roles
    const [roles, setRoles] = useLocalStorage('roles', initialData.roles);
    
    const addComplaint = (complaintData, companyId) => {
        const password = Math.floor(100000 + Math.random() * 900000).toString();
        const newComplaint = {
            // ... (resto del código sin cambios)
        };
        setComplaints(prev => [...prev, newComplaint]);
        return newComplaint;
    };
    
    const updateComplaint = (complaintId, updates, user) => {
        // ... (resto del código sin cambios)
    };
    
    const updateCompany = (companyId, updates) => {
        // ... (resto del código sin cambios)
    };

    const value = { 
        companies, setCompanies, 
        complaints, addComplaint, updateComplaint, 
        holidays, setHolidays, 
        updateCompany, 
        plans, setPlans,
        // Se exportan roles y setRoles
        roles, setRoles 
    };
    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
