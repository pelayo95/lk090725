// src/pages/admin/case-details/MeasuresTab.jsx
import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { useConfig } from '../../../contexts/ConfigContext';
import { Card, Button, Select, Modal, TextArea } from '../../../components/common';
import { Plus, Edit, User, Calendar, FileText, Copy } from 'lucide-react';
import { uuidv4 } from '../../../utils/uuid';
import { getUserNameById } from '../../../utils/userUtils';
import AddMeasureModal from './AddMeasureModal';
import { useNotification } from '../../../contexts/NotificationContext';

// Componente para el modal de solicitud de documentos
const DocumentationRequestModal = ({ isOpen, onClose, measure, complaint }) => {
    const { addToast } = useNotification();
    if (!isOpen) return null;

    const complainantName = complaint.originalData.complainant?.name || 'el/la denunciante';
    const accusedNames = (complaint.originalData.accusedPersons || []).map(p => p.name).join(', ') || 'el/la denunciado/a';

    const emailBody = `
Estimados,

Junto con saludar, y en el marco de la investigación del caso [${complaint.id}], se ha determinado la siguiente medida de resguardo:

- Tipo de Medida: ${measure.text}
- Fecha de Inicio: ${measure.startDate || 'No especificada'}
- Fecha de Término: ${measure.endDate || 'No especificada'}
- Descripción Adicional: ${measure.description || 'Sin descripción adicional.'}

Para dar cumplimiento a lo anterior, se solicita la emisión de la documentación laboral correspondiente (anexos de contrato, etc.) para formalizar esta medida para las siguientes partes:

- Denunciante: ${complainantName}
- Denunciado(s): ${accusedNames}

Agradecemos su pronta gestión.

Saludos cordiales,
Equipo de Investigación.
    `.trim();

    const copyToClipboard = () => {
        const textArea = document.createElement("textarea");
        textArea.value = emailBody;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            addToast('Borrador de correo copiado al portapapeles.', 'success');
        } catch (err) {
            addToast('Error al copiar el texto.', 'error');
        }
        document.body.removeChild(textArea);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Generar Solicitud de Documentación">
            <div className="space-y-4">
                <p className="text-sm text-slate-600">A continuación se presenta un borrador del correo de solicitud. Puede copiarlo y ajustarlo según sea necesario.</p>
                <TextArea
                    value={emailBody}
                    readOnly
                    rows={15}
                    className="bg-slate-50 font-mono text-xs"
                />
                <div className="flex justify-end gap-2">
                    <Button onClick={onClose} variant="secondary">Cerrar</Button>
                    <Button onClick={copyToClipboard} variant="primary">
                        <Copy className="w-4 h-4"/> Copiar Texto
                    </Button>
                </div>
            </div>
        </Modal>
    );
};


const MeasuresTab = ({ complaint }) => {
    const { user, allUsers } = useAuth();
    const { updateComplaint } = useData();
    const { getCompanyConfig } = useConfig();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToModify, setItemToModify] = useState(null);
    const [isDocRequestModalOpen, setIsDocRequestModalOpen] = useState(false);
    const [measureForDocRequest, setMeasureForDocRequest] = useState(null);
    
    const companyUsers = allUsers.filter(u => u.companyId === complaint.companyId);
    const config = getCompanyConfig(complaint.companyId);
    const defaultMeasures = config.defaultSafeguardMeasures || [];

    const handleSave = (itemData) => {
        let updatedMeasures;
        let action;

        if (itemData.id) {
            updatedMeasures = (complaint.safeguardMeasures || []).map(m => m.id === itemData.id ? { ...m, ...itemData } : m);
            action = `Medida de resguardo editada: "${itemData.text}"`;
        } else {
            const newItem = { id: uuidv4(), ...itemData };
            updatedMeasures = [...(complaint.safeguardMeasures || []), newItem];
            action = `Nueva medida de resguardo creada: "${newItem.text}"`;
        }
        
        const newAuditLogEntry = { id: uuidv4(), action, userId: user.uid, timestamp: new Date().toISOString() };
        updateComplaint(complaint.id, { safeguardMeasures: updatedMeasures, auditLog: [...complaint.auditLog, newAuditLogEntry] }, user);
        setIsModalOpen(false);
        setItemToModify(null);
    };
    
    const handleEditClick = (item) => {
        setItemToModify(item);
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setItemToModify(null);
        setIsModalOpen(true);
    };

    const handleStatusChange = (measureId, newStatus) => {
        const updatedMeasures = complaint.safeguardMeasures.map(m => m.id === measureId ? { ...m, status: newStatus } : m);
        const measureText = updatedMeasures.find(m => m.id === measureId).text;
        const newAuditLogEntry = { id: uuidv4(), action: `Estado de la medida "${measureText}" actualizado a: ${newStatus}`, userId: user.uid, timestamp: new Date().toISOString() };
        updateComplaint(complaint.id, { safeguardMeasures: updatedMeasures, auditLog: [...complaint.auditLog, newAuditLogEntry] }, user);
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Medidas de Resguardo</h3>
                {user.permissions.medidas_puede_crear && (
                    <Button onClick={handleAddClick} variant="primary">
                        <Plus className="w-4 h-4"/> Añadir Medida
                    </Button>
                )}
            </div>
            <div className="space-y-3">
                {(complaint.safeguardMeasures || []).length > 0 ? (
                    complaint.safeguardMeasures.map(m => (
                        <div key={m.id} className="p-3 border rounded-lg bg-white">
                             <div className="flex justify-between items-start">
                                <p className="text-slate-800 flex-1">{m.text}</p>
                                <div className="flex items-center">
                                    {user.permissions.medidas_puede_crear && (
                                        <Button variant="ghost" className="p-1 h-auto" title="Solicitar Documentación" onClick={() => { setMeasureForDocRequest(m); setIsDocRequestModalOpen(true); }}>
                                            <FileText className="w-4 h-4 text-blue-600"/>
                                        </Button>
                                    )}
                                    {user.permissions.medidas_puede_editar && (
                                        <Button variant="ghost" className="p-1 h-auto" onClick={() => handleEditClick(m)}><Edit className="w-4 h-4 text-slate-500"/></Button>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 mt-2">
                                <div className="flex-1 min-w-[150px]">
                                    <Select 
                                        value={m.status} 
                                        onChange={e => handleStatusChange(m.id, e.target.value)} 
                                        id={`measure-status-${m.id}`} 
                                        className="text-xs p-1"
                                        disabled={!user.permissions.medidas_puede_cambiar_estado}
                                    >
                                        {['Discusión', 'Aprobación', 'Implementación', 'Implementada', 'Seguimiento', 'Revisión'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </Select>
                                </div>
                                <span className="flex items-center gap-1"><User className="w-3 h-3"/>{getUserNameById(m.assignedTo, allUsers)}</span>
                                {m.endDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>Termina: {m.endDate}</span>}
                            </div>
                        </div>
                    ))
                ) : (
                     <p className="text-center text-slate-500 py-4">No hay medidas de resguardo para este caso.</p>
                )}
            </div>
             <AddMeasureModal 
                isOpen={isModalOpen}
                onClose={() => {setIsModalOpen(false); setItemToModify(null);}}
                onSubmit={handleSave}
                users={companyUsers}
                defaultMeasures={defaultMeasures}
                editingItem={itemToModify}
            />
            <DocumentationRequestModal
                isOpen={isDocRequestModalOpen}
                onClose={() => setIsDocRequestModalOpen(false)}
                measure={measureForDocRequest}
                complaint={complaint}
            />
        </Card>
    );
};

export default MeasuresTab;
