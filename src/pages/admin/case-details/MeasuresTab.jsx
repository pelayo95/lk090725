// src/pages/admin/case-details/MeasuresTab.jsx
import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { useConfig } from '../../../contexts/ConfigContext';
import { Card, Button, Select } from '../../../components/common';
import { Plus, Edit, User, Calendar } from 'lucide-react';
import { uuidv4 } from '../../../utils/uuid';
import { getUserNameById } from '../../../utils/userUtils';
import AddMeasureModal from './AddMeasureModal';

const MeasuresTab = ({ complaint }) => {
    const { user, allUsers } = useAuth();
    const { updateComplaint } = useData();
    const { getCompanyConfig } = useConfig();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToModify, setItemToModify] = useState(null);
    
    const companyUsers = allUsers.filter(u => u.companyId === complaint.companyId);
    const config = getCompanyConfig(complaint.companyId);
    const defaultMeasures = config.defaultSafeguardMeasures || [];

    const handleSave = (itemData) => {
        let updatedMeasures;
        let action;

        if (itemData.id) { // Editing
            updatedMeasures = complaint.safeguardMeasures.map(m => m.id === itemData.id ? { ...m, ...itemData } : m);
            action = `Medida de resguardo editada: "${itemData.text}"`;
        } else { // Adding
            const newItem = { id: uuidv4(), ...itemData };
            updatedMeasures = [...complaint.safeguardMeasures, newItem];
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
                <Button onClick={handleAddClick} variant="primary">
                    <Plus className="w-4 h-4"/> Añadir Medida
                </Button>
            </div>
            <div className="space-y-3">
                {complaint.safeguardMeasures.length > 0 ? (
                    complaint.safeguardMeasures.map(m => (
                        <div key={m.id} className="p-3 border rounded-lg bg-white">
                             <div className="flex justify-between items-start">
                                <p className="text-slate-800 flex-1">{m.text}</p>
                                <Button variant="ghost" className="p-1 h-auto" onClick={() => handleEditClick(m)}><Edit className="w-4 h-4 text-slate-500"/></Button>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 mt-2">
                                <div className="flex-1 min-w-[150px]">
                                    <Select value={m.status} onChange={e => handleStatusChange(m.id, e.target.value)} id={`measure-status-${m.id}`} className="text-xs p-1">
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
        </Card>
    );
};

export default MeasuresTab;
