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

        companyRules.forEach(rule => {
            // Evaluador para: "Caso Nuevo Sin Asignar"
            if (rule.trigger === 'new_case_unassigned') {
                complaints.forEach(c => {
                    const meetsBaseCondition = c.status === 'Ingresada' && c.investigatorIds.length === 0;
                    if (!meetsBaseCondition) return;

                    const delayMs = (rule.delayHours || 0) * 60 * 60 * 1000;
                    const caseAge = now.getTime() - new Date(c.createdAt).getTime();

                    if (caseAge < delayMs) return;

                    let conditionsMet = true;
                    if (rule.conditions) {
                        if (rule.conditions.severity && c.severity !== rule.conditions.severity) {
                            conditionsMet = false;
                        }
                    }

                    if (conditionsMet) {
                        generatedAlerts.push({
                            id: `rule-${rule.id}-${c.id}`,
                            type: 'rule_triggered',
                            text: rule.message.replace(/\[CODIGO_CASO\]/g, c.id),
                            caseId: c.id,
                            date: c.createdAt
                        });
                    }
                });
            }

            // Evaluador para: "Gestión por Vencer"
            if (rule.trigger === 'management_due_date_approaching') {
                complaints.forEach(c => {
                    (c.managements || []).forEach(m => {
                        if (m.completed || !m.dueDate) return;

                        const dueDate = new Date(m.dueDate + "T23:59:59");
                        const daysBeforeMs = (rule.daysBefore || 0) * 24 * 60 * 60 * 1000;
                        const timeDiff = dueDate.getTime() - now.getTime();
                        
                        if (timeDiff > 0 && timeDiff <= daysBeforeMs) {
                            const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                            generatedAlerts.push({
                                id: `rule-${rule.id}-${m.id}`,
                                type: 'rule_triggered',
                                text: rule.message
                                    .replace(/\[CODIGO_CASO\]/g, c.id)
                                    .replace(/\[TEXTO_GESTION\]/g, m.text)
                                    .replace(/\[DIAS_RESTANTES\]/g, daysRemaining),
                                caseId: c.id,
                                date: m.dueDate
                            });
                        }
                    });
                });
            }
        });
        
        // Aquí se podría añadir lógica para filtrar alertas según `rule.recipients`
        // Por ahora, se muestran todas las alertas generadas al usuario actual.
        
        return generatedAlerts.sort((a,b) => new Date(b.date) - new Date(a.date));

    }, [complaints, user, companyRules]);

    return alerts;
};
