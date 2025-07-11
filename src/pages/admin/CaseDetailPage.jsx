// src/pages/admin/CaseDetailPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Select } from '../../components/common';
import AssignInvestigators from './case-details/AssignInvestigators';
import InvestigationFlowManager from './case-details/InvestigationFlowManager';
import DetailsTab from './case-details/DetailsTab';
import TimelineTab from './case-details/TimelineTab';
import MeasuresTab from './case-details/MeasuresTab';
import ManagementsTab from './case-details/ManagementsTab';
import FilesTab from './case-details/FilesTab';
import SanctionsTab from './case-details/SanctionsTab';
import ChatTab from '../../components/shared/ChatTab';
import AuditLogTab from './case-details/AuditLogTab';
import { ChevronLeft, ClipboardList, Clock, Shield, ListChecks, Paperclip, Activity, MessageSquare, History, UserCheck } from 'lucide-react';
import { uuidv4 } from '../../utils/uuid';
import { userHasPermission } from '../../utils/userUtils';

const CaseDetailPage = ({ caseId }) => {
    const { complaints, updateComplaint, companies, plans } = useData();
    const { user, allUsers, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('details');
    const complaint = complaints.find(c => c.id === caseId);

    useEffect(() => {
        if(user && caseId){
             const newLastVisited = { ...user.lastVisited, [caseId]: new Date().toISOString() };
             updateUser(user.uid, { lastVisited: newLastVisited });
        }
    }, [caseId, user?.uid]);

    const userCompany = useMemo(() => companies.find(c => c.id === user.companyId), [companies, user]);
    const userPlan = useMemo(() => plans.find(p => p.id === userCompany?.planId), [plans, userCompany]);
    const features = userPlan?.features || {};
    
    if (!complaint) return <Card><h1 className="text-2xl font-bold text-slate-800 mb-6">Caso no encontrado</h1><a href="#admin/dashboard" className="text-indigo-600 hover:underline text-sm flex items-center gap-1"><ChevronLeft className="w-4 h-4"/> Volver al Dashboard</a></Card>;

    const companyInvestigators = useMemo(() => {
        return allUsers.filter(u => u.companyId === complaint.companyId && (u.roleId.includes('admin') || u.roleId.includes('investigador')));
    }, [allUsers, complaint]);

    const severityColors = {
        'Leve': 'bg-emerald-100 text-emerald-800 border-emerald-300',
        'Moderado': 'bg-amber-100 text-amber-800 border-amber-300',
        'Grave': 'bg-red-100 text-red-800 border-red-300',
        'Sin Asignar': 'bg-slate-100 text-slate-800 border-slate-300'
    };

    const handleSendPublicMessage = (text) => {
        const newMessage = { id: uuidv4(), text, senderId: user.uid, senderName: user.name, timestamp: new Date().toISOString() };
        const newAuditLog = [...complaint.auditLog, { id: uuidv4(), action: `Gestor envió un mensaje al denunciante.`, userId: user.uid, timestamp: new Date().toISOString() }];
        updateComplaint(complaint.id, { chatMessages: [...(complaint.chatMessages || []), newMessage], auditLog: newAuditLog }, user);
    };
    
    const handleSendAccusedMessage = (text) => {
        const newMessage = { id: uuidv4(), text, senderId: user.uid, senderName: user.name, timestamp: new Date().toISOString() };
        const newAuditLog = [...complaint.auditLog, { id: uuidv4(), action: `Gestor envió un mensaje a un denunciado.`, userId: user.uid, timestamp: new Date().toISOString() }];
        updateComplaint(complaint.id, { accusedChatMessages: [...(complaint.accusedChatMessages || []), newMessage], auditLog: newAuditLog }, user);
    };

    const handleSendInternalComment = (text) => {
        const newComment = { id: uuidv4(), text, senderId: user.uid, senderName: user.name, timestamp: new Date().toISOString() };
        const newAuditLog = [...complaint.auditLog, { id: uuidv4(), action: `Añadió un comentario interno.`, userId: user.uid, timestamp: new Date().toISOString() }];
        updateComplaint(complaint.id, { internalComments: [...(complaint.internalComments || []), newComment], auditLog: newAuditLog }, user);
    };

    const allTabs = [
        { id: 'details', label: 'Detalles', icon: <ClipboardList className="w-5 h-5"/>, permission: 'casos_ver_detalles', component: () => <DetailsTab complaint={complaint} /> },
        { id: 'timeline', label: 'Línea de Tiempo', icon: <Clock className="w-5 h-5"/>, permission: 'timeline_puede_ver', component: () => <TimelineTab complaint={complaint} onNavigate={setActiveTab} /> },
        { id: 'measures', label: 'Medidas de Resguardo', icon: <Shield className="w-5 h-5"/>, permission: 'medidas_puede_ver', component: () => <MeasuresTab complaint={complaint} /> },
        { id: 'managements', label: 'Gestiones', icon: <ListChecks className="w-5 h-5"/>, permission: 'gestiones_puede_ver', component: () => <ManagementsTab complaint={complaint} /> },
        { id: 'files', label: 'Archivos', icon: <Paperclip className="w-5 h-5"/>, permission: 'archivos_puede_ver_descargar', component: () => <FilesTab complaint={complaint} /> },
        { id: 'sanctions', label: 'Sanciones', icon: <Activity className="w-5 h-5"/>, permission: 'sanciones_puede_ver', component: () => <SanctionsTab complaint={complaint} /> },
        { id: 'communications', label: 'Com. Denunciante', icon: <MessageSquare className="w-5 h-5"/>, permission: 'comunicacion_denunciante_puede_ver', component: () => <ChatTab title="Comunicaciones con Denunciante" messages={complaint.chatMessages || []} onSendMessage={handleSendPublicMessage} currentUserId={user.uid} placeholder="Escribe un mensaje para el denunciante..." currentUserColor="bg-indigo-100" otherUserColor="bg-slate-200" complaintId={complaint.id} /> },
        { id: 'accused_communications', label: 'Com. Denunciado', icon: <UserCheck className="w-5 h-5"/>, permission: 'comunicacion_denunciante_puede_ver', component: () => <ChatTab title="Comunicaciones con Denunciado(s)" messages={complaint.accusedChatMessages || []} onSendMessage={handleSendAccusedMessage} currentUserId={user.uid} placeholder="Escribe un mensaje para el/los denunciado(s)..." currentUserColor="bg-indigo-100" otherUserColor="bg-slate-200" complaintId={complaint.id} /> },
        { id: 'internal_comments', label: 'Comentarios Internos', icon: <MessageSquare className="w-5 h-5"/>, permission: 'comentarios_internos_puede_ver', component: () => <ChatTab title="Comentarios Internos" messages={complaint.internalComments || []} onSendMessage={handleSendInternalComment} currentUserId={user.uid} placeholder="Escribe un comentario interno..." currentUserColor="bg-amber-100" otherUserColor="bg-slate-200" /> },
        { id: 'audit', label: 'Auditoría', icon: <History className="w-5 h-5"/>, permission: 'auditoria_puede_ver', component: () => <AuditLogTab auditLog={complaint.auditLog} /> }
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
                </div>
            </div>
            {userHasPermission(user, 'casos_puede_asignar_investigadores') && (
                <Card className="p-4">
                    <AssignInvestigators complaint={complaint} investigators={companyInvestigators}/>
                </Card>
            )}
            {userHasPermission(user, 'casos_puede_definir_flujo') && (
              <Card className="p-4 bg-slate-50">
                  <InvestigationFlowManager complaint={complaint} onUpdate={handleInvestigationFlowChange} />
              </Card>
            )}

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

            <div>
                <ActiveComponent />
            </div>
        </div>
    );
};

export default CaseDetailPage;
