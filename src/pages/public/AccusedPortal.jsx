// src/pages/public/AccusedPortal.jsx
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useConfig } from '../../contexts/ConfigContext';
import { Card, Button, Input, TextArea } from '../../components/common';
import { AddItemModal } from '../../components/common/AddItemModal';
import ChatTab from '../../components/shared/ChatTab';
import { uuidv4 } from '../../utils/uuid';
import { ClipboardList, MessageSquare, Users } from 'lucide-react';

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

const AccusedPortal = ({ complaint, accusedPerson, onBack }) => {
    const [activeTab, setActiveTab] = useState('details');
    const { updateComplaint } = useData();
    const { getCompanyConfig } = useConfig();

    if (!complaint || !accusedPerson) return <Card><p>Error al cargar la información.</p></Card>;
    
    const config = getCompanyConfig(complaint.companyId);

    const handleSendMessage = (text) => {
        const newMessage = {
            id: uuidv4(), text, senderId: accusedPerson.id, senderName: accusedPerson.name,
            timestamp: new Date().toISOString()
        };
        const updatedMessages = [...(complaint.accusedChatMessages || []), newMessage];
        const newAuditLog = [...complaint.auditLog, { id: uuidv4(), action: `Denunciado ${accusedPerson.name} envió un mensaje.`, userId: "accused", timestamp: new Date().toISOString() }];
        
        updateComplaint(complaint.id, { accusedChatMessages: updatedMessages, auditLog: newAuditLog }, null);
    };

    const tabs = [
        { id: 'details', label: 'Detalles de la Denuncia', icon: ClipboardList },
        { id: 'communications', label: 'Comunicaciones', icon: MessageSquare },
    ];

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
                {activeTab === 'details' && <AccusedDetailsSection complaint={complaint} config={config} />}
                {activeTab === 'communications' && <ChatTab 
                    title="Comunicaciones con Gestor"
                    messages={complaint.accusedChatMessages || []}
                    onSendMessage={handleSendMessage}
                    currentUserId={accusedPerson.id}
                    placeholder="Escribe un mensaje..."
                    currentUserColor="bg-sky-100"
                    otherUserColor="bg-slate-200"
                />}
            </div>
         </Card>
    );
};

export default AccusedPortal;
