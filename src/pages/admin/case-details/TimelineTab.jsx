// src/pages/admin/case-details/TimelineTab.jsx
import React, { useMemo, useCallback } from 'react';
import { useConfig } from '../../../contexts/ConfigContext';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Card, Tooltip } from '../../../components/common';
import { calculateEndDate } from '../../../services/dateUtils';
import { uuidv4 } from '../../../utils/uuid';
import { CheckCircle, ListChecks } from 'lucide-react';

const TimelineTab = ({ complaint, onNavigate }) => {
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
        // ... (lógica de cálculo de eventos sin cambios)
    }, [complaint, getTimelineSettings, holidays]);

    const handleToggle = (stageId, subStepIndex = null) => {
        // ... (lógica de marcado de etapas sin cambios)
    };
    
    // Nueva función para manejar clics en sub-etapas interactivas
    const handleSubStepClick = (subStep) => {
        switch (subStep.id) {
            case 'sub1': // Designar investigadores
                // Podríamos hacer scroll a la sección de investigadores en la misma página si estuviera visible
                // Por ahora, un simple log o alerta puede indicar la acción.
                console.log("Navegando a la sección de investigadores...");
                break;
            case 'sub2': // Notificar recepción
                onNavigate('communications'); // Llama a la función pasada por props para cambiar de pestaña
                break;
            case 'sub4': // Determinar medidas de resguardo
                onNavigate('measures');
                break;
            default:
                break;
        }
    };

    return (
        <Card>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Línea de Tiempo del Procedimiento</h3>
            {timelineEvents.length > 0 ? (
                <div className="relative border-l-2 border-indigo-200 ml-3">
                    {timelineEvents.map((event, index) => {
                        // ... (lógica de renderizado de la etapa principal sin cambios)
                        
                        return (
                            <div key={event.id} className="mb-8 ml-6">
                                {/* ... */}
                                <ul className="mt-2 space-y-2 pl-8">
                                    {(event.subSteps || []).map((sub, i) => {
                                        const subKey = `${event.id}_${i}`;
                                        const isSubCompleted = complaint.timelineProgress?.[subKey];
                                        const isSubDisabled = !user.permissions.timeline_puede_marcar_etapas || isDisabled;
                                        const isInteractive = ['sub1', 'sub2', 'sub4'].includes(sub.id);

                                        return (
                                            <li key={sub.id || i} className="flex items-center gap-2">
                                                <input type="checkbox" checked={isSubCompleted || false} disabled={isSubDisabled} onChange={() => handleToggle(event.id, i)}
                                                    className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${isSubDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}/>
                                                <span 
                                                    className={`text-xs ${isSubCompleted ? 'line-through text-slate-400' : 'text-slate-600'} ${isInteractive ? 'cursor-pointer hover:underline text-blue-600' : ''}`}
                                                    onClick={isInteractive ? () => handleSubStepClick(sub) : undefined}
                                                >
                                                    {sub.name}
                                                </span>
                                            </li>
                                        );
                                    })}
                                    {/* ... */}
                                </ul>
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
