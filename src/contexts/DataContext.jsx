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
    // Se añade un fallback a un objeto vacío para evitar errores si initialData.roles es undefined
    const [roles, setRoles] = useLocalStorage('roles', initialData.roles || {});
    // Se añade un fallback para las plantillas por robustez
    const [communicationTemplates, setCommunicationTemplates] = useLocalStorage('communicationTemplates', initialData.communicationTemplates || {});
    
    const addComplaint = (complaintData, companyId) => {
        const password = Math.floor(100000 + Math.random() * 900000).toString();
        const newComplaint = {
            ...complaintData,
            id: `CASO-${String(complaints.length + 1).padStart(3, '0')}`,
            companyId,
            password,
            createdAt: new Date().toISOString(),
            closedAt: null,
            status: "Ingresada",
            severity: "Sin Asignar",
            investigatorIds: [],
            receptionType: null,
            internalAction: null,
            dtComplaintDate: null,
            dtReceptionDate: null,
            managements: [
                { id: uuidv4(), text: "Definir si la investigación será interna o derivada a la Inspección del Trabajo", completed: false, dueDate: null, assignedTo: null }
            ],
            safeguardMeasures: [],
            internalComments: [],
            auditLog: [{ id: uuidv4(), action: "Creación de Denuncia", userId: "public", timestamp: new Date().toISOString() }],
            timelineProgress: {},
            chatMessages: [],
            caseFiles: [],
            sanctions: [],
            otherMeasures: [],
        };
        setComplaints(prev => [...prev, newComplaint]);
        return newComplaint;
    };
    
    const updateComplaint = (complaintId, updates, user) => {
        setComplaints(prev => prev.map(c => {
            if (c.id === complaintId) {
                const finalUpdates = {...updates};
                
                if(updates.status === 'Cerrada' && c.status !== 'Cerrada') {
                    finalUpdates.closedAt = new Date().toISOString();
                } else if (updates.status !== 'Cerrada' && c.status === 'Cerrada') {
                    finalUpdates.closedAt = null;
                }

                const auditLogEntries = [];
                for (const key in finalUpdates) {
                    if (Object.prototype.hasOwnProperty.call(finalUpdates, key) && !Array.isArray(finalUpdates[key]) && key !== 'timelineProgress' && key !== 'auditLog' && JSON.stringify(finalUpdates[key]) !== JSON.stringify(c[key])) {
                        auditLogEntries.push({
                            id: uuidv4(),
                            action: `Campo '${key}' actualizado.`,
                            userId: user?.uid || 'system',
                            timestamp: new Date().toISOString()
                        });
                    }
                }

                const newAuditLog = finalUpdates.auditLog ? finalUpdates.auditLog : [...c.auditLog, ...auditLogEntries];

                return { ...c, ...finalUpdates, auditLog: newAuditLog };
            }
            return c;
        }));
        addToast("Caso actualizado correctamente", "success");
    };
    
    const updateCompany = (companyId, updates) => {
        setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, ...updates } : c));
        addToast("Empresa actualizada", "success");
    };

    const value = { 
        companies, setCompanies, 
        complaints, addComplaint, updateComplaint, 
        holidays, setHolidays, 
        updateCompany, 
        plans, setPlans,
        roles, setRoles,
        communicationTemplates, setCommunicationTemplates 
    };
    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
