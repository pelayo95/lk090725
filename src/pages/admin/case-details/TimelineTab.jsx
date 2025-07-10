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
    const { user } = useAuth(); // Obtener usuario con permisos
    
    // ... (lógica de getTimelineSettings y timelineEvents sin cambios)

    const handleToggle = (stageId, subStepIndex = null) => {
        // ... (lógica de handleToggle sin cambios)
    };

    return (
        <Card>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Línea de Tiempo del Procedimiento</h3>
            {timelineEvents.length > 0 ? (
                <div className="relative border-l-2 border-indigo-200 ml-3">
                    {timelineEvents.map((event, index) => {
                        const isCompleted = complaint.timelineProgress?.[event.id];
                        const isPreviousStageCompleted = index === 0 || complaint.timelineProgress?.[timelineEvents[index - 1].id];
                        // Deshabilitar si no tiene permiso O si la etapa anterior no está completa
                        const isDisabled = !user.permissions.timeline_puede_marcar_etapas || (!isPreviousStageCompleted && !isCompleted);
                        const isOverdue = new Date() > event.endDate && !isCompleted;
                        
                        return (
                            <div key={event.id} className="mb-8 ml-6">
                                {/* ... (resto del JSX sin cambios, pero ahora `isDisabled` depende del permiso) */}
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
