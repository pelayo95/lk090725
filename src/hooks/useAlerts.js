// src/hooks/useAlerts.js
import { useMemo } from 'react';
import { useData } from '../contexts/DataContext';

export const useAlerts = (complaints, user) => {
    const { notificationRules } = useData();
    const companyRules = notificationRules[user.companyId] || [];

    const alerts = useMemo(() => {
        if (!user || !companyRules || companyRules.length === 0) return [];
        
        const now = new Date();
        const generatedAlerts = [];

        // Función para verificar si el usuario actual debe recibir la notificación
        const shouldUserReceiveAlert = (rule, complaint) => {
            if (!rule.recipients || rule.recipients.length === 0) return true; // Comportamiento por defecto

            return rule.recipients.some(recipient => {
                if (recipient === 'all_admins' && user.roleId.includes('admin')) return true;
                if (recipient === 'assigned_investigators' && complaint.investigatorIds.includes(user.uid)) return true;
                if (recipient === user.uid) return true; // Notificación a usuario específico
                return false;
            });
        };

        companyRules.forEach(rule => {
            // Evaluador para: "Caso Nuevo Sin Asignar"
            if (rule.trigger === 'new_case_unassigned') {
                complaints.forEach(c => {
                    if (c.status === 'Ingresada' && c.investigatorIds.length === 0) {
                        const delayMs = (rule.timing?.delayHours || 0) * 60 * 60 * 1000;
                        const caseAge = now.getTime() - new Date(c.createdAt).getTime();
                        
                        if (caseAge >= delayMs) {
                            // Verificar condiciones
                            const severityCondition = rule.conditions?.severity;
                            if (!severityCondition || severityCondition === 'any' || c.severity === severityCondition) {
                                if (shouldUserReceiveAlert(rule, c)) {
                                    generatedAlerts.push({
                                        id: `alert-${rule.id}-${c.id}`, type: 'new_case',
                                        text: rule.message.replace(/\[CODIGO_CASO\]/g, c.id),
                                        caseId: c.id, date: c.createdAt
                                    });
                                }
                            }
                        }
                    }
                });
            }

            // Evaluador para: "Gestión por Vencer"
            if (rule.trigger === 'management_due_date_approaching') {
                complaints.forEach(c => {
                    (c.managements || []).forEach(m => {
                        if (m.completed || !m.dueDate) return;

                        const dueDate = new Date(m.dueDate + "T23:59:59");
                        const daysBeforeMs = (rule.timing?.daysBefore || 0) * 24 * 60 * 60 * 1000;
                        const timeDiff = dueDate.getTime() - now.getTime();
                        
                        if (timeDiff > 0 && timeDiff <= daysBeforeMs) {
                            const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                             if (shouldUserReceiveAlert(rule, c)) {
                                generatedAlerts.push({
                                    id: `alert-${rule.id}-${m.id}`, type: 'deadline',
                                    text: rule.message
                                        .replace(/\[CODIGO_CASO\]/g, c.id)
                                        .replace(/\[TEXTO_GESTION\]/g, m.name)
                                        .replace(/\[DIAS_RESTANTES\]/g, daysRemaining),
                                    caseId: c.id, date: m.dueDate
                                });
                            }
                        }
                    });
                });
            }

            // Aquí se pueden añadir las lógicas para los nuevos triggers...
            // ej: case_status_changed, new_public_message
        });
        
        return generatedAlerts.sort((a,b) => new Date(b.date) - new Date(a.date));

    }, [complaints, user, companyRules]);

    return alerts;
};
