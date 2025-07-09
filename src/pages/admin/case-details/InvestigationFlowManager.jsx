// src/pages/admin/case-details/InvestigationFlowManager.jsx
import React from 'react';
import { Input, Select } from '../../../components/common';

const InvestigationFlowManager = ({ complaint, onUpdate }) => {
    
    const handleChange = (field, value) => {
        const updates = { [field]: value };
        if (field === 'receptionType') {
            updates.internalAction = null;
        }
        onUpdate(updates);
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Definición del Flujo de Investigación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            </div>
        </div>
    )
}

export default InvestigationFlowManager;
