// src/pages/admin/case-details/DetailsTab.jsx
import React, { useState } from 'react';
import { useConfig } from '../../../contexts/ConfigContext';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Card, Button, Tooltip } from '../../../components/common';
import { getNestedValue } from '../../../utils/objectUtils';
import { uuidv4 } from '../../../utils/uuid';
import { Edit, RotateCcw, Info, KeyRound } from 'lucide-react';
import EditFieldModal from './EditFieldModal';
import { userHasPermission } from '../../../utils/userUtils';
import { useNotification } from '../../../contexts/NotificationContext';

const DetailsTab = ({ complaint }) => {
    const { getCompanyConfig } = useConfig();
    const { updateComplaint } = useData();
    const { user } = useAuth();
    const { addToast } = useNotification();
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [fieldToEdit, setFieldToEdit] = useState(null);

    const config = getCompanyConfig(complaint.companyId);

    const openEditModal = (field) => {
        setFieldToEdit(field);
        setEditModalOpen(true);
    };

    const handleEditSave = (newValue) => {
        if (!fieldToEdit) return;
        const dataKey = fieldToEdit.dataKey;
        const newEditedData = { ...complaint.editedData, [dataKey]: newValue };
        const newAuditLog = [...complaint.auditLog, { id: uuidv4(), action: `Campo '${fieldToEdit.label}' modificado.`, userId: user.uid, timestamp: new Date().toISOString() }];
        updateComplaint(complaint.id, { editedData: newEditedData, auditLog: newAuditLog }, user);
        setEditModalOpen(false);
        setFieldToEdit(null);
    };

    const handleRevert = (dataKey, fieldLabel) => {
        const newEditedData = { ...complaint.editedData };
        delete newEditedData[dataKey];
        const newAuditLog = [...complaint.auditLog, { id: uuidv4(), action: `Campo '${fieldLabel}' restaurado a su valor original.`, userId: user.uid, timestamp: new Date().toISOString() }];
        updateComplaint(complaint.id, { editedData: newEditedData, auditLog: newAuditLog }, user);
    };

    const handleGenerateCredentials = () => {
        let credentialsGenerated = false;
        const updatedAccusedPersons = complaint.originalData.accusedPersons.map(person => {
            if (!person.accessCode || !person.password) {
                credentialsGenerated = true;
                const accessCode = `D-${uuidv4().slice(0, 6).toUpperCase()}`;
                const password = Math.floor(100000 + Math.random() * 900000).toString();
                return { ...person, accessCode, password };
            }
            return person;
        });

        if (credentialsGenerated) {
            const updatedOriginalData = { ...complaint.originalData, accusedPersons: updatedAccusedPersons };
            const newAuditLog = [...complaint.auditLog, { id: uuidv4(), action: `Se generaron credenciales para denunciados.`, userId: user.uid, timestamp: new Date().toISOString() }];
            updateComplaint(complaint.id, { originalData: updatedOriginalData, auditLog: newAuditLog }, user);
            addToast("Credenciales generadas exitosamente.", "success");
        } else {
            addToast("Las credenciales para todos los denunciados ya existen.", "info");
        }
    };


    const renderFieldValue = (field) => {
        const originalValue = getNestedValue(complaint.originalData, field.dataKey);
        const editedValue = getNestedValue(complaint.editedData, field.dataKey);
        const hasBeenEdited = editedValue !== undefined;
        let currentValue = hasBeenEdited ? editedValue : originalValue;

        if (field.dataKey.startsWith('complainant.') && !userHasPermission(user, 'casos_ver_datos_denunciante')) {
            return <span className="italic text-slate-500">Confidencial</span>;
        }
        
        if (field.type === 'accusedPersons') {
            if (!Array.isArray(currentValue) || currentValue.length === 0) return 'N/A';

            return (
                 <div className="col-span-2">
                    <div className="flex justify-end mb-2">
                       <Button variant="secondary" size="sm" onClick={handleGenerateCredentials}>
                           <KeyRound className="w-4 h-4" /> Generar Credenciales
                       </Button>
                    </div>
                    <div className="text-slate-700 font-medium space-y-2">
                        {currentValue.map((person, index) => (
                             <div key={person.id || index} className="p-3 border rounded-md bg-slate-50 text-xs">
                                 <p className="font-semibold">Persona Denunciada #{index + 1}: {person.name || 'N/A'}</p>
                                 <p>Cargo: {person.position || 'N/A'}</p>
                                 <p>Tipo: {person.employeeType || 'N/A'}</p>
                                 {person.employeeType === 'Trabajador de otra empresa' && (
                                     <p>Empleador: {person.employerName || 'N/A'}</p>
                                 )}

                                 {/* Muestra las credenciales directamente si existen */}
                                 {person.accessCode && person.password && (
                                     <div className="mt-2 pt-2 border-t border-slate-200">
                                         <p className="font-semibold text-sky-700">Credenciales de Acceso:</p>
                                         <p>Código: <span className="font-mono text-sky-600 bg-sky-100 px-1 rounded">{person.accessCode}</span></p>
                                         <p>Contraseña: <span className="font-mono text-sky-600 bg-sky-100 px-1 rounded">{person.password}</span></p>
                                     </div>
                                 )}
                             </div>
                        ))}
                    </div>
                 </div>
            );
        }

        if (['witnesses', 'documents'].includes(field.type)) {
            if (!Array.isArray(currentValue) || currentValue.length === 0) return 'N/A';
             return (
                <div className="col-span-2 text-slate-700 font-medium">
                    {currentValue.map((item, index) => (
                        <div key={item.id || index} className="mb-2 p-2 border rounded-md bg-slate-50 text-xs">
                            {field.type === 'witnesses' && <p>{item.name || 'Testigo sin nombre'}: {item.facts || ''}</p>}
                            {field.type === 'documents' && <p>{item.fileName || 'Archivo sin nombre'}: {item.description || ''}</p>}
                        </div>
                    ))}
                </div>
            );
        }

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
                                        {renderFieldValue(field)}
                                        {/* Lógica para botones de edición solo en campos simples */}
                                        {!['witnesses', 'documents', 'accusedPersons'].includes(field.type) && (
                                            <div className="flex items-center gap-1 pl-2">
                                                {getNestedValue(complaint.editedData, field.dataKey) !== undefined && (
                                                    <Tooltip text={`Original: ${getNestedValue(complaint.originalData, field.dataKey)}`}>
                                                        <Info className="w-4 h-4 text-sky-500 cursor-help"/>
                                                    </Tooltip>
                                                )}
                                                {userHasPermission(user, 'casos_puede_editar_denuncia') && field.editableOnManage && (
                                                    <Button variant="ghost" className="text-xs p-1 h-auto" onClick={() => openEditModal({ ...field, currentValue: getNestedValue(complaint.editedData, field.dataKey) ?? getNestedValue(complaint.originalData, field.dataKey) })}>
                                                        <Edit className="w-3 h-3"/>
                                                    </Button>
                                                )}
                                                {userHasPermission(user, 'casos_puede_editar_denuncia') && getNestedValue(complaint.editedData, field.dataKey) !== undefined && (
                                                     <Button variant="ghost" className="text-xs p-1 h-auto" onClick={() => handleRevert(field.dataKey, field.label)}>
                                                        <RotateCcw className="w-3 h-3 text-amber-600"/>
                                                    </Button>
                                                )}
                                            </div>
                                        )}
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
