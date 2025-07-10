// src/pages/admin/case-details/DetailsTab.jsx
import React, { useState } from 'react';
import { useConfig } from '../../../contexts/ConfigContext';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Card, Button, Tooltip } from '../../../components/common';
import { getNestedValue } from '../../../utils/objectUtils';
import { uuidv4 } from '../../../utils/uuid';
import { Edit, RotateCcw, Info } from 'lucide-react';
import EditFieldModal from './EditFieldModal';

const DetailsTab = ({ complaint }) => {
    const { getCompanyConfig } = useConfig();
    const { updateComplaint } = useData();
    const { user } = useAuth(); // Obtener usuario con permisos
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [fieldToEdit, setFieldToEdit] = useState(null);

    const config = getCompanyConfig(complaint.companyId);

    const openEditModal = (field) => {
        setFieldToEdit(field);
        setEditModalOpen(true);
    };

    const handleEditSave = (newValue) => {
        // ... (lógica de guardado sin cambios)
    };

    const handleRevert = (dataKey, fieldLabel) => {
        // ... (lógica de revertir sin cambios)
    };

    const renderFieldValue = (field) => {
        const originalValue = getNestedValue(complaint.originalData, field.dataKey);
        const editedValue = getNestedValue(complaint.editedData, field.dataKey);
        const hasBeenEdited = editedValue !== undefined;
        let currentValue = hasBeenEdited ? editedValue : originalValue;

        // Ocultar datos del denunciante si no tiene permiso
        if (field.dataKey.startsWith('complainant.') && !user.permissions.casos_ver_datos_denunciante) {
            return <span className="italic text-slate-500">Confidencial</span>;
        }
        
        // ... (resto de la lógica de renderizado de campos complejos)

        return currentValue === undefined || currentValue === null || currentValue === '' ? 'N/A' : String(currentValue);
    };

    return (
        <Card>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Detalles de la Denuncia</h3>
            <div className="space-y-6">
                {config.formSteps.map(step => (
                    <div key={step.id}>
                        <h4 className="text-md font-semibold text-indigo-700 mb-2">{step.title}</h4>
                        <dl className="space-y-3 text-sm">
                            {step.fields.map(field => (
                                <div key={field.id} className="grid md:grid-cols-3 gap-2 items-start">
                                    <dt className="text-slate-500">{field.label}:</dt>
                                    <dd className="col-span-2 text-slate-700 font-medium flex items-center justify-between">
                                        <span>{renderFieldValue(field)}</span>
                                        <div className="flex items-center gap-1">
                                            {/* ... (lógica de tooltip sin cambios) ... */}
                                            {user.permissions.casos_puede_editar_denuncia && field.editableOnManage && (
                                                <Button variant="ghost" className="text-xs p-1 h-auto" onClick={() => openEditModal({ ...field, currentValue: getNestedValue(complaint.editedData, field.dataKey) ?? getNestedValue(complaint.originalData, field.dataKey) })}>
                                                    <Edit className="w-3 h-3"/>
                                                </Button>
                                            )}
                                            {/* ... (lógica de revertir sin cambios) ... */}
                                        </div>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                ))}
            </div>
            {fieldToEdit && (
                <EditFieldModal
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    field={fieldToEdit}
                    onSave={handleEditSave}
                />
            )}
        </Card>
    );
};

export default DetailsTab;
