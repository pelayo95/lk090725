// src/pages/admin/case-details/AssignInvestigators.jsx
import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../../components/common';
import { uuidv4 } from '../../../utils/uuid';

const AssignInvestigators = ({ complaint, investigators }) => {
    const { updateComplaint } = useData();
    const { user, allUsers } = useAuth();
    const [isAssigning, setIsAssigning] = useState(false);
    const [tempSelectedIds, setTempSelectedIds] = useState(complaint.investigatorIds || []);

    useEffect(() => {
        setTempSelectedIds(complaint.investigatorIds || []);
    }, [complaint.investigatorIds]);
    
    const handleCheckboxChange = (id) => setTempSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    const handleSave = () => {
        const investigatorNames = tempSelectedIds.map(id => allUsers.find(u => u.uid === id)?.name || '?').join(', ');
        const newAuditLog = [...complaint.auditLog, { id: uuidv4(), action: `Caso asignado a: ${investigatorNames || 'Nadie'}.`, userId: user.uid, timestamp: new Date().toISOString() }];
        updateComplaint(complaint.id, { investigatorIds: tempSelectedIds, auditLog: newAuditLog }, user);
        setIsAssigning(false);
    };
    
    const handleCancel = () => {
        setTempSelectedIds(complaint.investigatorIds || []);
        setIsAssigning(false);
    };

    const assignedNames = (complaint.investigatorIds || []).map(id => investigators.find(i => i.uid === id)?.name).filter(Boolean).join(', ');

    if (!isAssigning) {
        return (
            <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                    <p className="text-sm font-medium text-slate-500">Investigador(es) Asignado(s)</p>
                    <p className="font-semibold">{assignedNames || 'Nadie asignado'}</p>
                </div>
                <Button onClick={() => setIsAssigning(true)} variant="secondary">Asignar / Modificar</Button>
            </div>
        );
    }
    
    return (
        <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Seleccione Investigadores</p>
            <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                {investigators.map(inv => (
                    <label key={inv.uid} className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-md cursor-pointer">
                        <input type="checkbox" checked={tempSelectedIds.includes(inv.uid)} onChange={() => handleCheckboxChange(inv.uid)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"/>
                        <span>{inv.name} ({inv.role})</span>
                    </label>
                ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <Button onClick={handleCancel} variant="secondary">Cancelar</Button>
                <Button onClick={handleSave}>Guardar Asignación</Button>
            </div>
        </div>
    );
};

export default AssignInvestigators;
