// src/pages/admin/CaseDetailPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Select, Button, Modal } from '../../components/common'; // Button y Modal añadidos
import AssignInvestigators from './case-details/AssignInvestigators';
import InvestigationFlowManager from './case-details/InvestigationFlowManager';
import MeasuresTab from './case-details/MeasuresTab';
import SanctionsTab from './case-details/SanctionsTab';
import AuditLogTab from './case-details/AuditLogTab';
import { ChevronLeft, Clock, Shield, Activity, MessageSquare, History, Folder, ListChecks } from 'lucide-react'; // Nuevos íconos
import { uuidv4 } from '../../utils/uuid';
import { userHasPermission } from '../../utils/userUtils';

// Importar los nuevos componentes contenedores
import ExpedienteTab from './case-details/ExpedienteTab';
import TimelineManagementsTab from './case-details/TimelineManagementsTab';
import CommunicationsTab from './case-details/CommunicationsTab';

const CaseDetailPage = ({ caseId }) => {
    const { complaints, updateComplaint, companies, plans } = useData();
    const { user, allUsers, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('expediente'); // Pestaña por defecto
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false); // Estado para el modal de auditoría
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
    }, [allUsers, complaint]);

    const severityColors = {
        'Leve': 'bg-emerald-100 text-emerald-800 border-emerald-300',
        'Moderado': 'bg-amber-100 text-amber-800 border-amber-300',
        'Grave': 'bg-red-100 text-red-800 border-red-300',
        'Sin Asignar': 'bg-slate-100 text-slate-800 border-slate-300'
    };

    const handleSendPublicMessage = (text) => { /* ... */ };
    const handleSendAccusedMessage = (text) => { /* ... */ };
    const handleSendInternalComment = (text) => { /* ... */ };

    // --- BARRA DE PESTAÑAS REESTRUCTURADA ---
    const allTabs = [
        { id: 'expediente', label: 'Expediente', icon: <Folder className="w-5 h-5"/>, permission: ['casos_ver_detalles', 'archivos_puede_ver_descargar'], component: () => <ExpedienteTab complaint={complaint} /> },
        { id: 'timeline_managements', label: 'Línea de Tiempo y Gestiones', icon: <ListChecks className="w-5 h-5"/>, permission: ['timeline_puede_ver', 'gestiones_puede_ver'], component: () => <TimelineManagementsTab complaint={complaint} onNavigate={setActiveTab} /> },
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
                    {/* --- BOTÓN DE AUDITORÍA --- */}
                    {userHasPermission(user, 'auditoria_puede_ver') && (
                        <Button variant="secondary" onClick={() => setIsAuditModalOpen(true)}>
                            <History className="w-4 h-4"/> Ver Auditoría
                        </Button>
                    )}
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

            {/* --- MODAL PARA LA AUDITORÍA --- */}
            <Modal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} title={`Auditoría del Caso: ${caseId}`}>
                <AuditLogTab auditLog={complaint.auditLog} />
            </Modal>
        </div>
    );
};

export default CaseDetailPage;
