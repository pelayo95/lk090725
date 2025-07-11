// src/pages/public/AccusedPortal.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { useData } from '../../contexts/DataContext';
import { useConfig } from '../../contexts/ConfigContext';
import { Card, Button, Input, TextArea } from '../../components/common';
import { getNestedValue } from '../../utils/objectUtils';
import { calculateEndDate } from '../../services/dateUtils';
import ChatTab from '../../components/shared/ChatTab';
import { uuidv4 } from '../../utils/uuid';
import { AddItemModal } from '../../components/common/AddItemModal';
import { ClipboardList, Clock, MessageSquare, Users, CheckCircle } from 'lucide-react';

const AccusedDetailsSection = ({ complaint, config }) => {
    const { accusedPortalSettings } = config;
    return (
        <div className="space-y-6">
            <div>
                <h4 className="font-semibold text-indigo-700 mb-3 border-b pb-1">Información General</h4>
                <dl className="space-y-3 text-sm">
                    <div className="grid md:grid-cols-3 gap-1">
                        <dt className="text-slate-500">Tipo de Conducta Denunciada:</dt>
                        <dd className="col-span-2 text-slate-700 font-medium">{complaint.originalData.case?.type || 'No especificado'}</dd>
                    </div>
                </dl>
            </div>
            <div>
                <h4 className="font-semibold text-indigo-700 mb-3 border-b pb-1">Personas Involucradas</h4>
                <p className="text-xs text-slate-500 mb-2">Se muestra la información de identificación de las partes.</p>
                <p className="font-medium text-sm">Denunciante:</p>
                <p className="text-sm text-slate-700 ml-4">{complaint.originalData.complainant?.name || 'Anónimo/No especificado'}</p>
                 <p className="font-medium text-sm mt-2">Denunciados:</p>
                {(complaint.originalData.accusedPersons || []).map(p => (
                    <p key={p.id} className="text-sm text-slate-700 ml-4">{p.name || 'No especificado'}</p>
                ))}
            </div>

            {accusedPortalSettings.canViewFacts && (
                 <div>
                    <h4 className="font-semibold text-indigo-700 mb-3 border-b pb-1">Hechos Denunciados</h4>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{complaint.originalData.facts?.description || 'No hay descripción de los hechos.'}</p>
                </div>
            )}
        </div>
    );
};

const AccusedTimelineSection = ({ complaint, config, holidays }) => {
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
        let lastEndDate = new Date(complaint.createdAt);

        return (settings || []).map((setting, index) => {
            let stageStartDate;
            if (index > 0 && setting.countFrom === 'previous-stage-end') {
                stageStartDate = new Date(lastEndDate);
            } else {
                 switch(setting.countFrom) {
                    case 'case-start': stageStartDate = new Date(complaint.createdAt); break;
                    case 'complaint-date': stageStartDate = new Date(complaint.dtComplaintDate || complaint.createdAt); break;
                    case 'reception-date': stageStartDate = new Date(complaint.dtReceptionDate || complaint.createdAt); break;
                    case 'day-zero':
                        const reception = new Date(complaint.dtReceptionDate || complaint.createdAt);
                        stageStartDate = calculateEndDate(reception, 3, 'habiles-administrativos', holidays);
                        break;
                    default: stageStartDate = new Date(complaint.createdAt);
                }
            }
            const stageEndDate = calculateEndDate(stageStartDate, setting.duration, setting.dayType, holidays);
            lastEndDate = stageEndDate;
            return { ...setting, startDate: stageStartDate, endDate: stageEndDate };
        });
    }, [complaint, getTimelineSettings, holidays]);

    const currentStageName = useMemo(() => {
        if (complaint.status === 'Cerrada') return 'Proceso Finalizado';
        if (!timelineEvents || timelineEvents.length === 0) return complaint.status;
        const firstIncompleteStage = timelineEvents.find(event => !complaint.timelineProgress?.[event.id]);
        return firstIncompleteStage ? firstIncompleteStage.name : "Proceso Finalizado";
    }, [timelineEvents, complaint]);

    return (
        <div>
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-indigo-700 mb-2">Estado Actual del Proceso</h3>
                <p className="font-medium bg-slate-100 p-3 rounded-md">{currentStageName}</p>
            </div>
             <h3 className="text-lg font-semibold text-indigo-700 mb-4">Línea de Tiempo Estimada</h3>
            <div className="relative border-l-2 border-indigo-200 ml-3">
                {timelineEvents.map((event) => {
                    const isCompleted = complaint.timelineProgress?.[event.id];
                    return (
                        <div key={event.id} className="mb-8 ml-6">
                            <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3.5 ring-8 ring-white ${isCompleted ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                <CheckCircle className="w-4 h-4 text-white"/>
                            </span>
                            <div className="p-4 bg-white border rounded-lg shadow-sm">
                                <h4 className={`text-md font-semibold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-800'}`}>{event.name}</h4>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const AccusedWitnessesSection = ({ complaint, updateComplaint }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const witnesses = complaint.accusedWitnesses || [];

    const handleAddWitness = (newWitnessData) => {
        const newWitness = { id: uuidv4(), ...newWitnessData };
        const newAuditLogEntry = { id: uuidv4(), action: `Denunciado añadió un nuevo testigo: "${newWitness.name}"`, userId: "accused", timestamp: new Date().toISOString() };
        
        updateComplaint(complaint.id, {
            accusedWitnesses: [...witnesses, newWitness],
            auditLog: [...complaint.auditLog, newAuditLogEntry]
        }, null);
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-indigo-700">Testigos a presentar</h3>
                <Button onClick={() => setIsModalOpen(true)}>Añadir Testigo</Button>
            </div>
             <ul className="space-y-2">
                {witnesses.map(w => (
                    <li key={w.id} className="p-3 bg-slate-50 rounded-md text-sm">
                        <p className="font-semibold">{w.name} ({w.position || 'N/A'})</p>
                        <p className="text-xs text-slate-600 mt-1">Puede declarar sobre: {w.facts}</p>
                    </li>
                ))}
                {witnesses.length === 0 && <p className="text-sm text-slate-500">No ha presentado testigos.</p>}
            </ul>
            <AddItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddWitness}
                title="Añadir Nuevo Testigo"
                initialState={{ name: '', position: '', facts: '' }}
            >
                {(formData, handleChange) => (
                     <>
                        <Input label="Nombre del Testigo" value={formData.name} onChange={e => handleChange('name', e.target.value)} required />
                        <Input label="Cargo/Relación con los hechos" value={formData.position} onChange={e => handleChange('position', e.target.value)} />
                        <TextArea label="¿Sobre qué hechos puede declarar?" value={formData.facts} onChange={e => handleChange('facts', e.target.value)} required />
                    </>
                )}
            </AddItemModal>
        </div>
    );
};

const AccusedPortal = ({ complaint, accusedPerson, onBack }) => {
    const [activeTab, setActiveTab] = useState('details');
    const { updateComplaint, holidays, companies } = useData();
    const { getCompanyConfig } = useConfig();

    if (!complaint || !accusedPerson) return <Card><p>Error al cargar la información.</p></Card>;
    
    const config = getCompanyConfig(complaint.companyId);
    const company = companies.find(c => c.id === complaint.companyId);

    const handleSendMessage = (text) => {
        const newMessage = {
            id: uuidv4(), text, senderId: accusedPerson.id, senderName: accusedPerson.name,
            timestamp: new Date().toISOString()
        };
        const updatedMessages = [...(complaint.accusedChatMessages || []), newMessage];
        const newAuditLog = [...complaint.auditLog, { id: uuidv4(), action: `Denunciado ${accusedPerson.name} envió un mensaje.`, userId: "accused", timestamp: new Date().toISOString() }];
        
        updateComplaint(complaint.id, {
            accusedChatMessages: updatedMessages,
            auditLog: newAuditLog
        }, null);
    };

    const tabs = [
        { id: 'details', label: 'Detalles de la Denuncia', icon: ClipboardList },
        { id: 'timeline', label: 'Línea de Tiempo', icon: Clock },
        { id: 'witnesses', label: 'Mis Testigos', icon: Users },
        { id: 'communications', label: 'Comunicaciones', icon: MessageSquare },
    ];

    const renderActiveTab = () => {
        switch(activeTab) {
            case 'details': return <AccusedDetailsSection complaint={complaint} config={config} />;
            case 'timeline': return <AccusedTimelineSection complaint={complaint} config={config} holidays={holidays} />;
            case 'witnesses': return <AccusedWitnessesSection complaint={complaint} updateComplaint={updateComplaint} />;
            case 'communications': return <ChatTab 
                title="Comunicaciones con Gestor"
                messages={complaint.accusedChatMessages || []}
                onSendMessage={handleSendMessage}
                currentUserId={accusedPerson.id}
                placeholder="Escribe un mensaje..."
                currentUserColor="bg-sky-100"
                otherUserColor="bg-slate-200"
            />;
            default: return null;
        }
    };

    return (
         <Card>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">Portal de Denunciado: {complaint.id}</h2>
                    <p className="mt-1 text-sm text-slate-500">Bienvenido/a, {accusedPerson.name}.</p>
                </div>
                 <Button onClick={onBack} variant="secondary">Salir</Button>
            </div>
             <div className="border-b border-slate-200 mb-6">
                 <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex-shrink-0 flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium ${activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                            <tab.icon className="w-5 h-5"/> {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div>
                {renderActiveTab()}
            </div>
         </Card>
    );
};

export default AccusedPortal;
