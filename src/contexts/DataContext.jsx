// src/contexts/DataContext.jsx
import React, { useContext, createContext, useState, useEffect, useCallback, useMemo } from 'react';
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
    const [notificationRules, setNotificationRules] = useLocalStorage('notificationRules', initialData.notificationRules || {});
    const [supportTickets, setSupportTickets] = useLocalStorage('supportTickets', initialData.supportTickets || []);

    useEffect(() => {
        setIsLoading(false);
    }, []);
    
    const addComplaint = useCallback((complaintData, companyId) => {
        const password = Math.floor(100000 + Math.random() * 900000).toString();
        const newComplaintId = `CASO-${uuidv4().slice(0, 6).toUpperCase()}`;
        
        const newComplaint = {
            ...complaintData,
            id: newComplaintId,
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
    }, [setComplaints]);
    
    const updateComplaint = useCallback((complaintId, updates, user) => {
        setComplaints(prevComplaints => prevComplaints.map(c => {
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
    }, [setComplaints, addToast]);
    
    const updateCompany = useCallback((companyId, updates) => {
        setCompanies(prevCompanies => prevCompanies.map(c => c.id === companyId ? { ...c, ...updates } : c));
        addToast("Empresa actualizada", "success");
    }, [setCompanies, addToast]);
    
    const addSupportTicket = useCallback((ticketData, user) => {
        setSupportTickets(prevTickets => {
            const newTicket = {
                ...ticketData,
                id: `TICKET-${String(prevTickets.length + 1).padStart(3, '0')}`,
                companyId: user.companyId,
                status: 'Abierto',
                createdAt: new Date().toISOString(),
                createdBy: user.uid,
            };
            return [...prevTickets, newTicket];
        });
        addToast("Ticket de soporte creado con éxito.", "success");
    }, [setSupportTickets, addToast]);

    const updateSupportTicket = useCallback((ticketId, updates) => {
        setSupportTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...updates } : t));
        addToast("Ticket actualizado.", "success");
    }, [setSupportTickets, addToast]);

    const value = useMemo(() => ({ 
        companies, setCompanies, 
        complaints, addComplaint, updateComplaint, 
        holidays, setHolidays, 
        updateCompany, 
        plans, setPlans,
        roles, setRoles,
        communicationTemplates, setCommunicationTemplates,
        notificationRules, setNotificationRules,
        supportTickets, addSupportTicket, updateSupportTicket
    }), [
        companies, complaints, holidays, plans, roles, communicationTemplates, notificationRules, supportTickets,
        setCompanies, setComplaints, setHolidays, setPlans, setRoles, setCommunicationTemplates, setNotificationRules, setSupportTickets,
        addComplaint, updateComplaint, updateCompany, addSupportTicket, updateSupportTicket
    ]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen bg-slate-100 text-slate-600">Cargando datos de la aplicación...</div>;
    }

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
