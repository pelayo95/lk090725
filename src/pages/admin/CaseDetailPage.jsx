// src/pages/admin/CaseDetailPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Select, Button, Modal } from '../../components/common';
import AssignInvestigators from './case-details/AssignInvestigators';
import InvestigationFlowManager from './case-details/InvestigationFlowManager';
import MeasuresTab from './case-details/MeasuresTab';
import SanctionsTab from './case-details/SanctionsTab';
import AuditLogTab from './case-details/AuditLogTab';
import { ChevronLeft, Folder, ListChecks, Shield, Activity, MessageSquare, History, Video } from 'lucide-react';
import { uuidv4 } from '../../utils/uuid';
import { userHasPermission } from '../../utils/userUtils';

// Importar los componentes contenedores y la nueva pestaña
import ExpedienteTab from './case-details/ExpedienteTab';
import TimelineManagementsTab from './case-details/TimelineManagementsTab';
import CommunicationsTab from './case-details/CommunicationsTab';
import InterviewsTab from './case-details/InterviewsTab';

const CaseDetailPage = ({ caseId }) => {
    const { complaints, updateComplaint } = useData();
    const { user, allUsers, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('expediente');
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const complaint = complaints.find(c => c.id === caseId);

    useEffect(() => {
        if(user && caseId){
             const newLastVisited = { ...user.lastVisited, [caseId]: new Date().toISOString() };
             updateUser(user.uid, { lastVisited: newLastVisited });
        }
    }, [caseId, user?.uid]);
    
    if (!complaint) return <Card><h1 className="text-2xl font-bold text-slate-800 mb-6">Caso no encontrado</h1><a href="#admin/dashboard" className="text-indigo-600 hover:underline text-sm flex items-center gap-1"><ChevronLeft className="w-4 h-4"/> Volver al Dashboard</a></Card>;

    const companyInvestigators = useMemo(() => {
        return allUsers.filter(u => u.companyId === complaint.companyId && (u.roleId.includes('admin') || u.roleId.includes('investigador')));
    }, [allUsers, complaint.companyId]);

    const severityColors = {
        'Leve': 'bg-emerald-100 text-emerald-800 border-emerald-300',
        'Moderado': 'bg-amber-100 text-amber-800 border-amber-300',
        'Grave': 'bg-red-100 text-red-800 border-red-300',
        'Sin Asignar': 'bg-slate-100 text-slate-800 border-slate-300'
    };

    const handleSendPublicMessage = (newMessage) => {
        const newAuditLog = [...complaint.auditLog, { id: uuidv4(), action: `Gestor envió un mensaje al denunciante.`, userId: user.uid, timestamp: new Date().toISOString() }];
        updateComplaint(complaint.id, { chatMessages: [...(complaint.chatMessages || []), newMessage], auditLog: newAuditLog }, user);
    };
    
    const handleSendAccusedMessage = (newMessage) => {
        const newAuditLog = [...complaint.auditLog, { id: uuidv4(), action: `Gestor envió un mensaje a un denunciado.`, userId: user.uid, timestamp: new Date().toISOString() }];
        updateComplaint(complaint.id, { accusedChatMessages: [...(complaint.accusedChatMessages || []), newMessage], auditLog: newAuditLog }, user);
    };

    const handleSendInternalComment = (newMessage) => {
        const newAuditLog = [...complaint.auditLog, { id: uuidv4(), action: `Añadió un comentario interno.`, userId: user.uid, timestamp: new Date().toISOString() }];
        updateComplaint(complaint.id, { internalComments: [...(complaint.internalComments || []), newMessage], auditLog: newAuditLog }, user);
    };

    const allTabs = [
        { id: 'expediente', label: 'Expediente', icon: <Folder className="w-5 h-5"/>, permission: ['casos_ver_detalles', 'archivos_puede_ver_descargar'], component: () => <ExpedienteTab complaint={complaint} /> },
        { id: 'timeline_managements', label: 'Línea de Tiempo y Gestiones', icon: <ListChecks className="w-5 h-5"/>, permission: ['timeline_puede_ver', 'gestiones_puede_ver'], component: () => <TimelineManagementsTab complaint={complaint} onNavigate={setActiveTab} /> },
        { id: 'interviews', label: 'Entrevistas', icon: <Video className="w-5 h-5"/>, permission: 'entrevistas_puede_gestionar', component: () => <InterviewsTab complaint={complaint} /> },
        { id: 'measures', label: 'Medidas de Resguardo', icon: <Shield className="w-5 h-5"/>, permission: 'medidas_puede_ver', component: () => <MeasuresTab complaint={complaint} /> },
        { id: 'sanctions', label: 'Sanciones', icon: <Activity className="w-5 h-5"/>, permission: 'sanciones_puede_ver', component: () => <SanctionsTab complaint={complaint} /> },
        { id: 'communications', label: 'Comunicaciones', icon: <MessageSquare className="w-5 h-5"/>, permission: ['comunicacion_denunciante_puede_ver', 'comentarios_internos_puede_ver'], component: () => <CommunicationsTab complaint={complaint} onSendPublicMessage={handleSendPublicMessage} onSendAccusedMessage={handleSendAccusedMessage} onSendInternalComment={handleSendInternalComment} /> },
    ];

    const visibleTabs = allTabs.filter(tab => userHasPermission(user, tab.permission));
    const ActiveComponent = visibleTabs.find(tab => tab.id === activeTab)?.component || (() => null);

    const handleSeverityChange = (e) => updateComplaint(caseId, { severity: e.target.value }, user);
    const handleInvestigationFlowChange = (updates) => updateComplaint(caseId, updates, user);
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                    <a href="#admin/dashboard" className="text-indigo-600 hover:underline text-sm flex items-center gap-1">
                        <ChevronLeft className="w-4 h-4"/> Volver al Dashboard
                    </a>
                    <h1 className="text-2xl font-bold text-slate-800 mt-1">Caso: {caseId}</h1>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1.5 rounded-md text-sm font-semibold border ${severityColors[complaint.severity]}`}>{complaint.severity}</span>
                    <Select id="severity" value={complaint.severity} onChange={handleSeverityChange}>
                        <option>Sin Asignar</option><option>Leve</option><option>Moderado</option><option>Grave</option>
                    </Select>
                    {userHasPermission(user, 'auditoria_puede_ver') && (
                        <Button variant="secondary" onClick={() => setIsAuditModalOpen(true)}>
                            <History className="w-4 h-4"/> Ver Auditoría
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {userHasPermission(user, 'casos_puede_asignar_investigadores') && (
                    <Card className="p-4 h-full">
                        <AssignInvestigators complaint={complaint} investigators={companyInvestigators}/>
                    </Card>
                )}
                {userHasPermission(user, 'casos_puede_definir_flujo') && (
                  <Card className="p-4 h-full">
                      <InvestigationFlowManager complaint={complaint} onUpdate={handleInvestigationFlowChange} />
                  </Card>
                )}
            </div>

            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {visibleTabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex-shrink-0 flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium ${activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-6">
                <ActiveComponent />
            </div>

            <Modal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} title={`Auditoría del Caso: ${caseId}`}>
                <AuditLogTab auditLog={complaint.auditLog} />
            </Modal>
        </div>
    );
};

export default CaseDetailPage;
