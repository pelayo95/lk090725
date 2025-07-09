// src/hooks/useAlerts.js
import { useMemo } from 'react';

export const useAlerts = (complaints, user) => {
    const alerts = useMemo(() => {
        if(!user) return [];
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));

        const lastVisited = user.lastVisited || {};

        const allAlerts = [];

        complaints.forEach(c => {
            const lastVisitTimestamp = new Date(lastVisited[c.id] || 0);
            const isUserInvestigator = c.investigatorIds.includes(user.uid);

            // 1. New case alert (for admins until assigned)
            if (user.role === 'admin' && c.status === "Ingresada" && c.investigatorIds.length === 0) {
                allAlerts.push({ id: `new-${c.id}`, type: 'new_case', text: `Nuevo caso sin asignar: ${c.id}`, caseId: c.id, date: c.createdAt });
            }

            // 2. New assignment alert
            const assignmentLog = c.auditLog.find(log => log.action.includes('Caso asignado a:') && new Date(log.timestamp) > lastVisitTimestamp);
            if(assignmentLog && c.investigatorIds.includes(user.uid)) {
                allAlerts.push({ id: `assign-${c.id}`, type: 'assignment', text: `Has sido asignado al caso ${c.id}`, caseId: c.id, date: assignmentLog.timestamp });
            }
            
            if(isUserInvestigator) {
                 // 3. Upcoming deadlines
                (c.managements || []).forEach(m => {
                    if (m.dueDate && !m.completed) {
                        const dueDate = new Date(m.dueDate + "T23:59:59");
                        if (dueDate <= threeDaysFromNow && dueDate > now) {
                             allAlerts.push({ id: `due-${m.id}`, type: 'deadline', text: `Plazo por vencer para gestión en caso ${c.id}`, caseId: c.id, date: m.dueDate });
                        }
                    }
                });

                // 4. New activity
                const latestMessage = (c.chatMessages || []).slice(-1)[0];
                if(latestMessage && new Date(latestMessage.timestamp) > lastVisitTimestamp && latestMessage.senderId !== user.uid) {
                    allAlerts.push({ id: `activity-msg-${c.id}`, type: 'activity', text: `Nuevo mensaje en el caso ${c.id}`, caseId: c.id, date: latestMessage.timestamp });
                }
            }
        });
        
        return allAlerts.sort((a,b) => new Date(b.date) - new Date(a.date));

    }, [complaints, user]);

    return alerts;
};
