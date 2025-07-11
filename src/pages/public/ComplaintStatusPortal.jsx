// src/pages/public/ComplaintStatusPortal.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { useData } from '../../contexts/DataContext';
import { useConfig } from '../../contexts/ConfigContext';
import { Card, Button, Input, TextArea } from '../../components/common';
import { getNestedValue } from '../../utils/objectUtils';
import { calculateEndDate } from '../../services/dateUtils';
import ChatTab from '../../components/shared/ChatTab';
import { uuidv4 } from '../../utils/uuid';
import { AddItemModal } from '../../components/common/AddItemModal';
import { ClipboardList, Clock, Paperclip, MessageSquare, Users, CheckCircle } from 'lucide-react';

// --- Sub-componente para la pestaña de Detalles ---
const DetailsSection = ({ complaint, config }) => (
    <div className="space-y-6">
        {config.formSteps.map(step => (
            <div key={step.id}>
                <h4 className="font-semibold text-indigo-700 mb-3 border-b pb-1">{step.title}</h4>
                <dl className="space-y-3 text-sm">
                    {step.fields.map(field => {
                        const value = getNestedValue(complaint.originalData, field.dataKey);
                        if (!value || (Array.isArray(value) && value.length === 0)) return null;

                        let displayValue;
                        if (field.type === 'accusedPersons' && Array.isArray(value)) {
                            displayValue = (
                                <div className="space-y-2">
                                    {value.map(p => (
                                        <div key={p.id} className="text-xs p-2 border rounded-md bg-slate-50">
                                            <p><span className="font-semibold">Nombre:</span> {p.name || 'N/A'}</p>
                                        </div>
                                    ))}
                                </div>
                            );
                        } else if (field.type === 'witnesses' && Array.isArray(value)) {
                             displayValue = value.map(w => w.name).join(', ') || 'N/A';
                        } else if (field.type === 'documents' && Array.isArray(value)) {
                            displayValue = value.map(d => d.fileName || 'Archivo').join(', ') || 'N/A';
                        } else {
                            displayValue = String(value);
                        }
                        
                        return (
                            <div key={field.id} className="grid md:grid-cols-3 gap-1">
                                <dt className="text-slate-500">{field.label}:</dt>
                                <dd className="col-span-2 text-slate-700 font-medium">{displayValue}</dd>
                            </div>
                        );
                    })}
                </dl>
            </div>
        ))}
    </div>
);


// --- Sub-componente para la pestaña de Línea de Tiempo ---
const TimelineSection = ({ complaint, config, holidays }) => {
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
                                <p className="text-sm text-slate-500">Vence aprox.: <span className="font-medium text-slate-600">{event.endDate.toLocaleDateString()}</span></p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Sub-componente para la pestaña de Archivos ---
const FilesSection = ({ complaint, updateComplaint }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const caseFiles = complaint.caseFiles || [];

    const handleAddFile = (newFileData) => {
        const newFile = {
            id: uuidv4(),
            fileName: newFileData.fileName,
            description: newFileData.description,
            category: "Presentados por denunciante",
            uploadedByUserId: 'public',
            uploadedAt: new Date().toISOString(),
        };
        const newAuditLogEntry = {
            id: uuidv4(),
            action: `Denunciante adjuntó un nuevo archivo: "${newFile.fileName}"`,
            userId: "public",
            timestamp: new Date().toISOString()
        };
        const updatedFiles = [...caseFiles, newFile];
        updateComplaint(complaint.id, { 
            caseFiles: updatedFiles, 
            auditLog: [...complaint.auditLog, newAuditLogEntry] 
        }, null);
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-indigo-700">Archivos Adjuntos</h3>
                <Button onClick={() => setIsModalOpen(true)}>Añadir Archivo</Button>
            </div>
            <ul className="space-y-2">
                {caseFiles.map(file => (
                    <li key={file.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-md text-sm">
                        <Paperclip className="w-4 h-4 text-slate-500" />
                        <span>{file.fileName}</span>
                    </li>
                ))}
                {caseFiles.length === 0 && <p className="text-sm text-slate-500">No hay archivos adjuntos.</p>}
            </ul>

            <AddItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddFile}
                title="Añadir Nuevo Archivo"
                initialState={{ fileName: '', description: '' }}
            >
                {(formData, handleChange) => (
                    <>
                        <Input type="file" onChange={(e) => {if(e.target.files.length > 0) handleChange('fileName', e.target.files[0].name)}} required />
                        <TextArea label="Descripción breve del archivo" value={formData.description} onChange={e => handleChange('description', e.target.value)} required />
                    </>
                )}
            </AddItemModal>
        </div>
    );
};

// --- Sub-componente para la pestaña de Testigos ---
const WitnessesSection = ({ complaint, updateComplaint }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const witnesses = complaint.originalData.evidence?.witnesses || [];

    const handleAddWitness = (newWitnessData) => {
        const newWitness = {
            id: uuidv4(),
            name: newWitnessData.name,
            position: newWitnessData.position,
            facts: newWitnessData.facts
        };
        const newAuditLogEntry = {
            id: uuidv4(),
            action: `Denunciante añadió un nuevo testigo: "${newWitness.name}"`,
            userId: "public",
            timestamp: new Date().toISOString()
        };
        const updatedOriginalData = {
            ...complaint.originalData,
            evidence: {
                ...complaint.originalData.evidence,
                witnesses: [...witnesses, newWitness]
            }
        };
        updateComplaint(complaint.id, {
            originalData: updatedOriginalData,
            auditLog: [...complaint.auditLog, newAuditLogEntry]
        }, null);
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-indigo-700">Testigos</h3>
                <Button onClick={() => setIsModalOpen(true)}>Añadir Testigo</Button>
            </div>
             <ul className="space-y-2">
                {witnesses.map(w => (
                    <li key={w.id} className="p-3 bg-slate-50 rounded-md text-sm">
                        <p className="font-semibold">{w.name} ({w.position || 'N/A'})</p>
                        <p className="text-xs text-slate-600 mt-1">Puede declarar sobre: {w.facts}</p>
                    </li>
                ))}
                {witnesses.length === 0 && <p className="text-sm text-slate-500">No hay testigos registrados.</p>}
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


// --- Componente Principal del Portal de Estado ---
const ComplaintStatusPortal = ({ complaint, onBack }) => {
    const [activeTab, setActiveTab] = useState('timeline');
    const { updateComplaint, complaints, holidays, companies } = useData();
    const { getCompanyConfig } = useConfig();
    
    // Obtiene la versión más reciente del caso desde el contexto.
    const currentComplaint = complaints.find(c => c.id === complaint.id);

    // GUARDA DE SEGURIDAD: Previene el error si el caso no se encuentra.
    if (!currentComplaint) {
        return <Card><p>Cargando información del caso...</p></Card>;
    }
    
    const config = getCompanyConfig(currentComplaint.companyId);
    const company = companies.find(c => c.id === currentComplaint.companyId);

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

    const tabs = [
        { id: 'timeline', label: 'Línea de Tiempo', icon: Clock },
        { id: 'details', label: 'Mi Denuncia', icon: ClipboardList },
        { id: 'files', label: 'Archivos', icon: Paperclip },
        { id: 'witnesses', label: 'Testigos', icon: Users },
        { id: 'communications', label: 'Comunicaciones', icon: MessageSquare },
    ];

    const renderActiveTab = () => {
        switch(activeTab) {
            case 'details': return <DetailsSection complaint={currentComplaint} config={config} />;
            case 'timeline': return <TimelineSection complaint={currentComplaint} config={config} holidays={holidays} />;
            case 'files': return <FilesSection complaint={currentComplaint} updateComplaint={updateComplaint} />;
            case 'witnesses': return <WitnessesSection complaint={currentComplaint} updateComplaint={updateComplaint} />;
            case 'communications': return <ChatTab 
                    title="Comunicaciones con Gestor"
                    messages={currentComplaint.chatMessages || []}
                    onSendMessage={handleSendMessage}
                    currentUserId="complainant"
                    placeholder="Escribe un mensaje..."
                    currentUserColor="bg-sky-100"
                    otherUserColor="bg-slate-200"
                />;
            default: return null;
        }
    }

    return (
        <Card>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">Portal de Seguimiento: {currentComplaint.id}</h2>
                    <p className="mt-1 text-sm text-slate-500">Empresa: {company?.name || 'N/A'}</p>
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
            
            <div className="p-1">
                {renderActiveTab()}
            </div>
        </Card>
    )
};

export default ComplaintStatusPortal;
