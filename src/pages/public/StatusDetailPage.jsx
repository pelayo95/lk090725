// src/pages/public/StatusDetailPage.jsx
import React, { useMemo, useCallback } from 'react';
import { useData } from '../../contexts/DataContext';
import { useConfig } from '../../contexts/ConfigContext';
import { Card, Button } from '../../components/common';
import { getNestedValue } from '../../utils/objectUtils';
import { calculateEndDate } from '../../services/dateUtils';
import ChatTab from '../../components/shared/ChatTab';
import { uuidv4 } from '../../utils/uuid';

const StatusDetailPage = ({ complaint, onBack, holidays }) => {
    const { complaints: allComplaints, updateComplaint, plans, companies } = useData();
    
    // Se busca la versión más actualizada del caso desde el contexto global
    const currentComplaint = allComplaints.find(c => c.id === complaint.id);

    // --- INICIO DE LA CORRECCIÓN ---
    // Si el caso aún no se encuentra o no está disponible, mostramos un estado de carga.
    // Esto previene el error al intentar acceder a propiedades de un objeto nulo.
    if (!currentComplaint) {
        return (
            <Card>
                <p className="text-center text-slate-600">Cargando información del caso...</p>
            </Card>
        );
    }
    // --- FIN DE LA CORRECCIÓN ---

    const { getCompanyConfig } = useConfig();
    const config = getCompanyConfig(currentComplaint.companyId);
    
    const company = useMemo(() => companies.find(c => c.id === currentComplaint.companyId), [currentComplaint, companies]);
    const plan = useMemo(() => plans.find(p => p.id === company?.planId), [company, plans]);
    const features = plan?.features || {};

    const getTimelineSettings = useCallback(() => {
        const { receptionType, internalAction } = currentComplaint;
        if (receptionType === 'interna') {
            if (internalAction === 'investigar') return config.timelineSettings.interna;
            if (internalAction === 'derivar') return config.timelineSettings.derivada;
        } else if (receptionType === 'notificada') {
            return config.timelineSettings.notificada;
        }
        return [];
    }, [currentComplaint, config.timelineSettings]);
    
    const timelineEvents = useMemo(() => {
        const settings = getTimelineSettings();
        let lastEndDate = new Date(currentComplaint.createdAt);

        return (settings || []).map((setting, index) => {
            let stageStartDate;
            
            if (index > 0 && setting.countFrom === 'previous-stage-end') {
                stageStartDate = new Date(lastEndDate);
            } else {
                 switch(setting.countFrom) {
                    case 'case-start': stageStartDate = new Date(currentComplaint.createdAt); break;
                    case 'complaint-date': stageStartDate = new Date(currentComplaint.dtComplaintDate || currentComplaint.createdAt); break;
                    case 'reception-date': stageStartDate = new Date(currentComplaint.dtReceptionDate || currentComplaint.createdAt); break;
                    case 'day-zero':
                        const reception = new Date(currentComplaint.dtReceptionDate || currentComplaint.createdAt);
                        stageStartDate = calculateEndDate(reception, 3, 'habiles-administrativos', holidays);
                        break;
                    default: stageStartDate = new Date(currentComplaint.createdAt);
                }
            }
            
            const stageEndDate = calculateEndDate(stageStartDate, setting.duration, setting.dayType, holidays);
            lastEndDate = stageEndDate;

            return { ...setting, startDate: stageStartDate, endDate: stageEndDate };
        });
    }, [currentComplaint, getTimelineSettings, holidays]);

    const currentStageName = useMemo(() => {
        if (currentComplaint.status === 'Cerrada') return 'Proceso Finalizado';
        if (!timelineEvents || timelineEvents.length === 0) {
            return currentComplaint.status; // Fallback
        }
        const firstIncompleteStage = timelineEvents.find(event => !currentComplaint.timelineProgress?.[event.id]);

        if(firstIncompleteStage) {
            return firstIncompleteStage.name;
        }
        
        return "Proceso Finalizado";
    }, [timelineEvents, currentComplaint]);

    const handleSendMessage = (text) => {
        const newMessage = {
            id: uuidv4(), text, senderId: 'complainant', senderName: 'Denunciante',
            timestamp: new Date().toISOString()
        };
        const newAuditLog = [ ...currentComplaint.auditLog,
            { id: uuidv4(), action: `Denunciante envió un mensaje.`, userId: "public", timestamp: new Date().toISOString() }
        ];
        updateComplaint(currentComplaint.id, {
            chatMessages: [...(currentComplaint.chatMessages || []), newMessage],
            auditLog: newAuditLog
        }, null); 
    };

    const activeMeasures = (currentComplaint.safeguardMeasures || []).filter(m => m.status === "Implementada");

    return (
        <Card>
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">Estado del Caso: {currentComplaint.id}</h2>
                    <p className="mt-1 text-sm text-slate-500">Fecha de ingreso: {new Date(currentComplaint.createdAt).toLocaleDateString()}</p>
                </div>
                 <Button onClick={onBack} variant="secondary">Cerrar</Button>
            </div>
            
            <div className="mt-6 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-indigo-700 mb-2">Estado Actual</h3>
                      <p className="font-medium bg-slate-100 p-3 rounded-md">{currentStageName}</p>
                </div>

                {features.visualizacionMedidas && activeMeasures.length > 0 && (
                       <div>
                           <h3 className="text-lg font-semibold text-indigo-700 mb-2">Medidas de Resguardo Vigentes</h3>
                           <ul className="list-disc list-inside space-y-1 bg-slate-100 p-3 rounded-md">
                              {activeMeasures.map(measure => ( <li key={measure.id} className="text-sm">{measure.text}</li> ))}
                           </ul>
                       </div>
                )}
                
                {features.canalComunicacionDenunciante && <ChatTab 
                    title="Comunicaciones con Gestor"
                    messages={currentComplaint.chatMessages || []}
                    onSendMessage={handleSendMessage}
                    currentUserId="complainant"
                    placeholder="Escribe un mensaje..."
                    currentUserColor="bg-sky-100"
                    otherUserColor="bg-slate-200"
                />}
                
                <div>
                      <h3 className="text-lg font-semibold text-indigo-700 mb-2">Detalles de su Denuncia</h3>
                       <div className="space-y-4">
                        {config.formSteps.map((step) => (
                            <div key={step.id} className="p-4 border border-slate-200 rounded-lg">
                                <h4 className="font-semibold text-slate-800 mb-3">{step.title}</h4>
                                <dl className="space-y-2 text-sm">
                                    {step.fields.map(field => {
                                        const value = getNestedValue(currentComplaint.originalData, field.dataKey);
                                        if (!value || (Array.isArray(value) && value.length === 0)) return null;

                                        if (field.type === 'accusedPersons' && Array.isArray(value)) {
                                            return (
                                                <div key={field.id} className="grid grid-cols-3 gap-2">
                                                    <dt className="text-slate-500">{field.label}:</dt>
                                                    <dd className="col-span-2 text-slate-700 font-medium space-y-2">
                                                        {value.map((person) => (
                                                            <div key={person.id} className="text-xs p-2 border rounded-md bg-slate-50">
                                                                <p><span className="font-semibold">Nombre:</span> {person.name || 'N/A'}</p>
                                                                <p><span className="font-semibold">Cargo:</span> {person.position || 'N/A'}</p>
                                                                <p><span className="font-semibold">Tipo:</span> {person.employeeType || 'N/A'}</p>
                                                                {person.employerName && <p><span className="font-semibold">Empleador:</span> {person.employerName}</p>}
                                                            </div>
                                                        ))}
                                                    </dd>
                                                </div>
                                            );
                                        }

                                        let displayValue = Array.isArray(value) ? value.join(', ') : value;
                                        if (field.type === 'witnesses' && Array.isArray(value)) {
                                            displayValue = value.map(w => w.name).join(', ') || 'N/A';
                                        } else if (field.type === 'documents' && Array.isArray(value)) {
                                            displayValue = value.map(d => d.fileName || 'Archivo').join(', ') || 'N/A';
                                        }
                                        
                                        return (
                                            <div key={field.id} className="grid grid-cols-3 gap-2">
                                                <dt className="text-slate-500">{field.label}:</dt>
                                                <dd className="col-span-2 text-slate-700 font-medium">{displayValue}</dd>
                                            </div>
                                        );
                                    })}
                                </dl>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    )
};

export default StatusDetailPage;
