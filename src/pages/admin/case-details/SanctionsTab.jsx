// src/pages/admin/case-details/SanctionsTab.jsx
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { Card, Button, Select, Input, TextArea, ConfirmationModal } from '../../../components/common';
import { AddItemModal } from '../../../components/common/AddItemModal';
import { getUserNameById, userHasPermission } from '../../../utils/userUtils';
import { uuidv4 } from '../../../utils/uuid';
import { Plus, Edit, Trash, User, Calendar } from 'lucide-react';

const SanctionsTab = ({ complaint }) => {
    const { user, allUsers } = useAuth();
    const { updateComplaint } = useData();
    const { addToast } = useNotification();
    
    const [isSanctionModalOpen, setIsSanctionModalOpen] = useState(false);
    const [sanctionToModify, setSanctionToModify] = useState(null);
    const [sanctionToDelete, setSanctionToDelete] = useState(null);

    const [isOtherMeasureModalOpen, setIsOtherMeasureModalOpen] = useState(false);
    const [otherMeasureToModify, setOtherMeasureToModify] = useState(null);
    const [otherMeasureToDelete, setOtherMeasureToDelete] = useState(null);

    const companyUsers = useMemo(() => allUsers.filter(u => u.companyId === complaint.companyId), [allUsers, complaint.companyId]);
    
    const handleSaveSanction = (itemData) => {
        let updatedSanctions;
        let action;
        if (itemData.id) {
             updatedSanctions = complaint.sanctions.map(s => s.id === itemData.id ? { ...s, ...itemData } : s);
             action = `Sanción editada: "${itemData.type}"`;
        } else {
             const newItem = { id: uuidv4(), ...itemData };
             updatedSanctions = [...(complaint.sanctions || []), newItem];
             action = `Nueva sanción registrada: "${newItem.type}"`;
        }
        
        const newAuditLogEntry = { id: uuidv4(), action, userId: user.uid, timestamp: new Date().toISOString() };
        updateComplaint(complaint.id, { sanctions: updatedSanctions, auditLog: [...complaint.auditLog, newAuditLogEntry] }, user);
        addToast(itemData.id ? "Sanción actualizada" : "Sanción añadida", "success");
        setIsSanctionModalOpen(false);
        setSanctionToModify(null);
    };

    const confirmDeleteSanction = () => {
        if (!sanctionToDelete) return;
        const sanctionType = sanctionToDelete.type;
        const updatedSanctions = complaint.sanctions.filter(s => s.id !== sanctionToDelete.id);
        const newAuditLogEntry = { id: uuidv4(), action: `Sanción eliminada: "${sanctionType}"`, userId: user.uid, timestamp: new Date().toISOString() };
        updateComplaint(complaint.id, { sanctions: updatedSanctions, auditLog: [...complaint.auditLog, newAuditLogEntry] }, user);
        addToast("Sanción eliminada", "success");
        setSanctionToDelete(null);
    };
    
    const handleSaveOtherMeasure = (itemData) => {
        let updatedMeasures;
        let action;
        if(itemData.id) {
            updatedMeasures = (complaint.otherMeasures || []).map(m => m.id === itemData.id ? { ...m, ...itemData } : m);
            action = `Otra medida editada: "${itemData.description}"`;
        } else {
            const newItem = { id: uuidv4(), ...itemData };
            updatedMeasures = [...(complaint.otherMeasures || []), newItem];
            action = `Nueva otra medida registrada: "${newItem.description}"`;
        }
        
        const newAuditLogEntry = { id: uuidv4(), action, userId: user.uid, timestamp: new Date().toISOString() };
        updateComplaint(complaint.id, { otherMeasures: updatedMeasures, auditLog: [...complaint.auditLog, newAuditLogEntry] }, user);
        addToast(itemData.id ? "Medida actualizada" : "Medida añadida", "success");
        setIsOtherMeasureModalOpen(false);
        setOtherMeasureToModify(null);
    };

    const confirmDeleteOtherMeasure = () => {
        if (!otherMeasureToDelete) return;
        const measureDesc = otherMeasureToDelete.description;
        const updatedMeasures = (complaint.otherMeasures || []).filter(m => m.id !== otherMeasureToDelete.id);
        const newAuditLogEntry = { id: uuidv4(), action: `Otra medida eliminada: "${measureDesc}"`, userId: user.uid, timestamp: new Date().toISOString() };
        updateComplaint(complaint.id, { otherMeasures: updatedMeasures, auditLog: [...complaint.auditLog, newAuditLogEntry] }, user);
        addToast("Medida eliminada", "success");
        setOtherMeasureToDelete(null);
    };

    const sanctionTypes = ["Amonestación verbal", "Amonestación escrita", "Multa", "Desvinculación"];

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Sanciones</h3>
                {userHasPermission(user, 'sanciones_puede_crear_editar') && (
                    <Button onClick={() => { setSanctionToModify(null); setIsSanctionModalOpen(true); }} variant="primary">
                        <Plus className="w-4 h-4"/> Registrar Sanción
                    </Button>
                )}
            </div>
            <div className="space-y-3">
                {(complaint.sanctions || []).map(s => (
                    <div key={s.id} className="p-4 rounded-lg bg-white border border-slate-200">
                       <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-red-700">{s.type}</p>
                                <p className="text-sm text-slate-600 mt-1">{s.description}</p>
                            </div>
                            <div className="flex gap-1">
                                {userHasPermission(user, 'sanciones_puede_crear_editar') && (
                                    <Button variant="ghost" className="p-1 h-auto" onClick={() => { setSanctionToModify(s); setIsSanctionModalOpen(true); }}><Edit className="w-4 h-4 text-slate-500"/></Button>
                                )}
                                {userHasPermission(user, 'sanciones_puede_eliminar') && (
                                    <Button variant="ghost" className="p-1 h-auto" onClick={() => setSanctionToDelete(s)}><Trash className="w-4 h-4 text-red-500"/></Button>
                                )}
                            </div>
                       </div>
                        <div className="text-xs text-slate-500 flex items-center gap-4 mt-2 border-t pt-2">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>Aplicada: {new Date(s.applicationDate + 'T00:00:00').toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><User className="w-3 h-3"/>Responsable: {getUserNameById(s.responsibleUserId, allUsers)}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Otras Medidas</h3>
                    {userHasPermission(user, 'sanciones_puede_crear_editar') && (
                        <Button onClick={() => { setOtherMeasureToModify(null); setIsOtherMeasureModalOpen(true); }} variant="secondary">
                            <Plus className="w-4 h-4"/> Añadir Otra Medida
                        </Button>
                    )}
                </div>
                 <div className="space-y-3">
                    {(complaint.otherMeasures || []).map(m => (
                        <div key={m.id} className="p-4 rounded-lg bg-white border border-slate-200">
                           <div className="flex justify-between items-
