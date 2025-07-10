// src/pages/admin/case-details/InvestigationFlowManager.jsx
import React, { useState } from 'react';
import { Input, Select, Button } from '../../../components/common';
import { Edit } from 'lucide-react';

const InvestigationFlowManager = ({ complaint, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(!complaint.receptionType);

    const handleChange = (field, value) => {
        const updates = { [field]: value };
        if (field === 'receptionType') {
            updates.internalAction = null;
        }
        onUpdate(updates);
    };

    if (!isEditing) {
        return (
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">Flujo de Investigación Definido</h3>
                    <p className="text-sm text-slate-600">
                        Origen: <span className="font-medium">{complaint.receptionType === 'interna' ? 'Recibida internamente' : 'Notificada por DT'}</span>
                        {complaint.internalAction && `, Acción: ${complaint.internalAction === 'investigar' ? 'Investigación interna' : 'Derivada a DT'}`}
                    </p>
                </div>
                <Button variant="secondary" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2"/> Modificar
                </Button>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Definición del Flujo de Investigación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                <Select label="Origen de la Denuncia" id="receptionType" value={complaint.receptionType || ''} onChange={e => handleChange('receptionType', e.target.value)}>
                    <option value="" disabled>-- Seleccione una opción --</option>
                    <option value="interna">Recibida internamente</option>
                    <option value="notificada">Notificada por Dirección del Trabajo</option>
                </Select>

                {complaint.receptionType === 'interna' && (
                    <Select label="Acción a Tomar" id="internalAction" value={complaint.internalAction || ''} onChange={e => handleChange('internalAction', e.target.value)}>
                        <option value="" disabled>-- Seleccione una opción --</option>
                        <option value="investigar">Realizar investigación interna</option>
                        <option value="derivar">Derivar a la DT</option>
                    </Select>
                )}
                
                {complaint.receptionType === 'notificada' && (
                    <>
                        <Input label="Fecha de la Denuncia (DT)" type="date" value={complaint.dtComplaintDate || ''} onChange={(e) => handleChange('dtComplaintDate', e.target.value)} />
                        <Input label="Fecha de Recepción Notificación" type="date" value={complaint.dtReceptionDate || ''} onChange={(e) => handleChange('dtReceptionDate', e.target.value)} />
                    </>
                )}
                <Button onClick={() => setIsEditing(false)} disabled={!complaint.receptionType || (complaint.receptionType === 'interna' && !complaint.internalAction)}>
                    Confirmar Flujo
                </Button>
            </div>
        </div>
    )
}

export default InvestigationFlowManager;
