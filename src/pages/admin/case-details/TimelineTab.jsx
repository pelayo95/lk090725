// src/pages/admin/case-details/TimelineTab.jsx
import React, { useMemo, useCallback } from 'react';
import { useConfig } from '../../../contexts/ConfigContext';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Card, Tooltip } from '../../../components/common';
import { calculateEndDate } from '../../../services/dateUtils';
import { uuidv4 } from '../../../utils/uuid';
import { CheckCircle, ListChecks } from 'lucide-react';

const TimelineTab = ({ complaint }) => {
    const { getCompanyConfig } = useConfig();
    const { holidays, updateComplaint } = useData();
    const { user } = useAuth();
    const config = getCompanyConfig(complaint.companyId);
    
    const getTimelineSettings = useCallback(() => {
        const { receptionType, internalAction } = complaint;
        if (receptionType === 'interna') {
            return internalAction === 'investigar' ? config.timelineSettings.interna : config.timelineSettings.derivada;
        } else if (receptionType === 'notificada') {
            return config.timelineSettings.notificada;
        }
        return [];
    }, [complaint, config.timelineSettings]);

    const timelineEvents = useMemo(() => {
        const settings = getTimelineSettings();
        if (!settings) return [];
        let cumulativeEndDate = new Date(complaint.createdAt);

        return settings.map((setting) => {
            let stageStartDate;
            switch(setting.countFrom) {
                case 'case-start': stageStartDate = new Date(complaint.createdAt); break;
                case 'complaint-date': stageStartDate = new Date(complaint.dtComplaintDate || complaint.createdAt); break;
                case 'reception-date': stageStartDate = new Date(complaint.dtReceptionDate || complaint.createdAt); break;
                case 'day-zero':
                    const reception = new Date(complaint.dtReceptionDate || complaint.createdAt);
                    stageStartDate = calculateEndDate(reception, 3, 'habiles-administrativos', holidays);
                    break;
                case 'previous-stage-end':
                default: stageStartDate = new Date(cumulativeEndDate);
            }
            
            const stageEndDate = calculateEndDate(stageStartDate, setting.duration, setting.dayType, holidays);
            
            const managementTasks = (complaint.managements || []).filter(m => {
                if (!m.dueDate) return false;
                const dueDate = new Date(m.dueDate + 'T00:00:00');
                return dueDate >= stageStartDate && dueDate <= stageEndDate;
            });
            
            cumulativeEndDate = stageEndDate;

            return { ...setting, startDate: stageStartDate, endDate: stageEndDate, managementTasks };
        });
    }, [complaint, getTimelineSettings, holidays]);

    const handleToggle = (stageId, subStepIndex = null) => {
        let newProgress = { ...complaint.timelineProgress };
        const settings = getTimelineSettings();
        const stage = settings.find(s => s.id === stageId);
        let logAction = '';
        
        if (subStepIndex === null) {
            const isCompleted = !newProgress[stageId];
            newProgress[stageId] = isCompleted;
            logAction = `Etapa '${stage.name}' marcada como ${isCompleted ? 'completada' : 'pendiente'}`;
            if (stage.subSteps) stage.subSteps.forEach((_, index) => { newProgress[`${stageId}_${index}`] = isCompleted; });
        } else {
            const key = `${stageId}_${subStepIndex}`;
            const isCompleted = !newProgress[key];
            newProgress[key] = isCompleted;
            logAction = `Sub-etapa '${stage.subSteps[subStepIndex].name}' marcada como ${isCompleted ? 'completada' : 'pendiente'}`;
            newProgress[stageId] = stage.subSteps.every((_, index) => newProgress[`${stageId}_${index}`]);
        }
        const newAuditLog = [...complaint.auditLog, { id: uuidv4(), action: logAction, userId: user.uid, timestamp: new Date().toISOString() }];
        updateComplaint(complaint.id, { timelineProgress: newProgress, auditLog: newAuditLog }, user);
    };

    return (
        <Card>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Línea de Tiempo del Procedimiento</h3>
            {timelineEvents.length > 0 ? (
                <div className="relative border-l-2 border-indigo-200 ml-3">
                    {timelineEvents.map((event, index) => {
                        const isCompleted = complaint.timelineProgress?.[event.id];
                        const isPreviousStageCompleted = index === 0 || complaint.timelineProgress?.[timelineEvents[index - 1].id];
                        const isDisabled = !user.permissions.timeline_puede_marcar_etapas || (!isPreviousStageCompleted && !isCompleted);
                        const isOverdue = new Date() > event.endDate && !isCompleted;
                        
                        return (
                            <div key={event.id} className="mb-8 ml-6">
                                <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3.5 ring-8 ring-white ${isCompleted ? 'bg-emerald-500' : isOverdue ? 'bg-red-500' : 'bg-slate-300'}`}>
                                    <CheckCircle className="w-4 h-4 text-white"/>
                                </span>
                                <div className={`p-4 bg-white border rounded-lg shadow-sm`}>
                                    <div className="flex items-center gap-4">
                                        <Tooltip text={isDisabled ? "No tiene permiso o debe completar la etapa anterior." : ""}>
                                            <input type="checkbox" checked={isCompleted || false} disabled={isDisabled} onChange={() => handleToggle(event.id)}
                                                className={`h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}/>
                                        </Tooltip>
                                        <div>
                                            <h4 className={`text-md font-semibold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-800'}`}>{event.name}</h4>
                                            <p className="text-sm text-slate-500">Vence: <span className="font-medium text-slate-600">{event.endDate.toLocaleDateString()}</span></p>
                                        </div>
                                    </div>
                                    <ul className="mt-2 space-y-2 pl-8">
                                        {(event.subSteps || []).map((sub, i) => {
                                            const subKey = `${event.id}_${i}`;
                                            const isSubCompleted = complaint.timelineProgress?.[subKey];
                                            const isSubDisabled = !user.permissions.timeline_puede_marcar_etapas || isDisabled;
                                            return (
                                                <li key={sub.id || i} className="flex items-center gap-2">
                                                    <input type="checkbox" checked={isSubCompleted || false} disabled={isSubDisabled} onChange={() => handleToggle(event.id, i)}
                                                        className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${isSubDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}/>
                                                    <span className={`text-xs ${isSubCompleted ? 'line-through text-slate-400' : 'text-slate-600'}`}>{sub.name}</span>
                                                </li>
                                            );
                                        })}
                                        {(event.managementTasks || []).map(task => (
                                            <li key={task.id} className="flex items-center gap-2">
                                                <ListChecks className="w-4 h-4 text-indigo-400"/>
                                                <span className={`text-xs ${task.completed ? 'line-through text-slate-400' : 'text-slate-600'}`}>{task.text} (Gestión)</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-center text-slate-500 py-4">Defina el flujo de la investigación para ver la línea de tiempo.</p>
            )}
        </Card>
    );
};

export default TimelineTab;
