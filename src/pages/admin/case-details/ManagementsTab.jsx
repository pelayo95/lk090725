// src/pages/admin/case-details/ManagementsTab.jsx
import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { Card, Button, Select, Input, TextArea, ConfirmationModal } from '../../../components/common';
import { AddItemModal } from '../../../components/common/AddItemModal';
import { getUserNameById } from '../../../utils/userUtils';
import { uuidv4 } from '../../../utils/uuid';
import { Plus, Edit, Trash, User, Calendar } from 'lucide-react';

const ManagementsTab = ({ complaint }) => {
    const { user, allUsers } = useAuth();
    const { updateComplaint } = useData();
    const { addToast } = useNotification();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [itemToModify, setItemToModify] = useState(null);

    const companyUsers = allUsers.filter(u => u.companyId === complaint.companyId);
    
    const handleSave = (itemData) => {
        let updatedManagements;
        let action;

        if(itemData.id) {
             updatedManagements = complaint.managements.map(m => m.id === itemData.id ? { ...m, ...itemData } : m);
             action = `Gestión editada: "${itemData.name}"`;
        } else {
             const newItem = { id: uuidv4(), ...itemData, completed: false };
             updatedManagements = [...(complaint.managements || []), newItem];
             action = `Nueva gestión creada: "${newItem.name}"`;
        }
        
        const newAuditLogEntry = { id: uuidv4(), action, userId: user.uid, timestamp: new Date().toISOString() };
        updateComplaint(complaint.id, { managements: updatedManagements, auditLog: [...complaint.auditLog, newAuditLogEntry] }, user);
        addToast(itemData.id ? "Gestión actualizada" : "Gestión añadida", "success");
        setIsModalOpen(false);
        setItemToModify(null);
    };
    
    const handleEditClick = (item) => {
        setItemToModify(item);
        setIsModalOpen(true);
    }
    
    const handleAddClick = () => {
        setItemToModify(null);
        setIsModalOpen(true);
    }

    const handleToggleComplete = (managementId) => {
        const updatedManagements = complaint.managements.map(m => m.id === managementId ? {...m, completed: !m.completed } : m);
        const newStatus = updatedManagements.find(m => m.id === managementId).completed;
        const newAuditLogEntry = { id: uuidv4(), action: `Gestión "${updatedManagements.find(m => m.id === managementId).name}" marcada como ${newStatus ? 'completada' : 'pendiente'}.`, userId: user.uid, timestamp: new Date().toISOString() };
        updateComplaint(complaint.id, { managements: updatedManagements, auditLog: [...complaint.auditLog, newAuditLogEntry] }, user);
    };
    
    const handleDeleteClick = (management) => {
        setItemToModify(management);
        setConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (!itemToModify) return;
        
        const managementText = itemToModify.name;
        const updatedManagements = complaint.managements.filter(m => m.id !== itemToModify.id);
        const newAuditLogEntry = { id: uuidv4(), action: `Gestión eliminada: "${managementText}"`, userId: user.uid, timestamp: new Date().toISOString() };
        updateComplaint(complaint.id, { managements: updatedManagements, auditLog: [...complaint.auditLog, newAuditLogEntry] }, user);
        addToast("Gestión eliminada", "success");
        setConfirmModalOpen(false);
        setItemToModify(null);
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Plan de Gestión</h3>
                {user.permissions.gestiones_puede_crear && (
                    <Button onClick={handleAddClick} variant="primary">
                        <Plus className="w-4 h-4"/> Añadir Gestión
                    </Button>
                )}
            </div>

            <div className="space-y-3">
                {complaint.managements.length > 0 ? (
                    complaint.managements.map(m => (
                        <div key={m.id} className={`p-3 rounded-lg flex items-start gap-4 transition-colors ${m.completed ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'} border`}>
                            {user.permissions.gestiones_puede_marcar_completa ? (
                                <input type="checkbox" checked={m.completed} onChange={() => handleToggleComplete(m.id)}
                                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer mt-1 flex-shrink-0"
                                />
                            ) : (
                                <div className={`h-5 w-5 rounded mt-1 flex-shrink-0 ${m.completed ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            )}
                            <div className="flex-1">
                                <p className={`font-semibold text-slate-800 ${m.completed ? 'line-through text-slate-500' : ''}`}>{m.name}</p>
                                <p className={`text-sm text-slate-600 ${m.completed ? 'line-through text-slate-500' : ''}`}>{m.text}</p>
                                <div className="text-xs text-slate-500 flex items-center gap-4 mt-1">
                                    <span className="flex items-center gap-1"><User className="w-3 h-3"/>{getUserNameById(m.assignedTo, allUsers)}</span>
                                    {m.dueDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>Vence: {m.dueDate}</span>}
                                </div>
                            </div>
                            <div className="flex gap-1">
                                {user.permissions.gestiones_puede_editar_asignar && (
                                    <Button variant="ghost" className="p-1 h-auto" onClick={() => handleEditClick(m)}><Edit className="w-4 h-4 text-slate-500"/></Button>
                                )}
                                {user.permissions.gestiones_puede_eliminar && (
                                    <Button variant="ghost" className="p-1 h-auto" onClick={() => handleDeleteClick(m)}><Trash className="w-4 h-4 text-red-500"/></Button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-slate-500 py-4">No hay gestiones asignadas a este caso.</p>
                )}
            </div>

            <AddItemModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleSave}
                title={itemToModify ? "Editar Gestión" : "Añadir Nueva Gestión"}
                initialState={itemToModify || { name: '', text: '', assignedTo: companyUsers[0]?.uid || '', dueDate: '' }}
                isEditing={!!itemToModify}
            >
                {(formData, handleChange) => (
                    <>
                        <Input label="Nombre de la Gestión" id="mng-name" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} required />
                        <TextArea label="Descripción de la Tarea" id="mng-text" value={formData.text} onChange={e => handleChange('text', e.target.value)} required />
                        <Select label="Asignar A" id="mng-assign" value={formData.assignedTo} onChange={e => handleChange('assignedTo', e.target.value)} required>
                            {companyUsers.map(u => <option key={u.uid} value={u.uid}>{u.name}</option>)}
                        </Select>
                        <Input label="Fecha de Vencimiento (Opcional)" id="mng-due" type="date" value={formData.dueDate} onChange={e => handleChange('dueDate', e.target.value)} />
                    </>
                )}
            </AddItemModal>

            <ConfirmationModal isOpen={confirmModalOpen} onClose={() => setConfirmModalOpen(false)} onConfirm={confirmDelete} title="Confirmar Eliminación">
                <p>¿Está seguro de que desea eliminar esta gestión? Esta acción no se puede deshacer.</p>
            </ConfirmationModal>
        </Card>
    );
};

export default ManagementsTab;
