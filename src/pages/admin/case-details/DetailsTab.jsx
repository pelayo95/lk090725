// src/pages/admin/case-details/DetailsTab.jsx
import React, { useState } from 'react';
import { useConfig } from '../../../contexts/ConfigContext';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Card, Button, Tooltip } from '../../../components/common';
import { AddItemModal } from '../../../components/common/AddItemModal';
import { getNestedValue } from '../../../utils/objectUtils';
import { uuidv4 } from '../../../utils/uuid';
import { Edit, RotateCcw, Info, KeyRound } from 'lucide-react';
import EditFieldModal from './EditFieldModal';
import { userHasPermission } from '../../../utils/userUtils';

const DetailsTab = ({ complaint }) => {
    const { getCompanyConfig } = useConfig();
    const { updateComplaint } = useData();
    const { user } = useAuth();
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [fieldToEdit, setFieldToEdit] = useState(null);
    const [credentialModalOpen, setCredentialModalOpen] = useState(false);
    const [generatedCredentials, setGeneratedCredentials] = useState([]);

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
        const credentials = [];
        const updatedAccusedPersons = complaint.originalData.accusedPersons.map(person => {
            if (!person.accessCode || !person.password) {
                const accessCode = `D-${uuidv4().slice(0, 6).toUpperCase()}`;
                const password = Math.floor(100000 + Math.random() * 900000).toString();
                credentials.push({ name: person.name, accessCode, password });
                return { ...person, accessCode, password };
            }
            credentials.push({ name: person.name, accessCode: person.accessCode, password: person.password });
            return person;
        });

        const updatedOriginalData = { ...complaint.originalData, accusedPersons: updatedAccusedPersons };
        const newAuditLog = [...complaint.auditLog, { id: uuidv4(), action: `Se generaron/consultaron credenciales para denunciados.`, userId: user.uid, timestamp: new Date().toISOString() }];
        updateComplaint(complaint.id, { originalData: updatedOriginalData, auditLog: newAuditLog }, user);
        
        setGeneratedCredentials(credentials);
        setCredentialModalOpen(true);
    };

    const renderFieldValue = (field) => {
        const originalValue = getNestedValue(complaint.originalData, field.dataKey);
        const editedValue = getNestedValue(complaint.editedData, field.dataKey);
        const hasBeenEdited = editedValue !== undefined;
        let currentValue = hasBeenEdited ? editedValue : originalValue;

        if (field.dataKey.startsWith('complainant.') && !userHasPermission(user, 'casos_ver_datos_denunciante')) {
            return <span className="italic text-slate-500">Confidencial</span>;
        }
        
        if (['witnesses', 'documents', 'accusedPersons'].includes(field.type)) {
            if (!Array.isArray(currentValue) || currentValue.length === 0) return 'N/A';

            if (field.type === 'accusedPersons') {
                return (
                    <div className="col-span-2">
                        <div className="flex justify-end mb-2">
                           <Button variant="secondary" size="sm" onClick={handleGenerateCredentials}>
                               <KeyRound className="w-4 h-4" /> Generar/Ver Credenciales
                           </Button>
                        </div>
                        <div className="text-slate-700 font-medium">
                            {currentValue.map((item, index) => (
                                 <div key={item.id || index} className="mb-2 p-2 border rounded-md bg-slate-50 text-xs">
                                     <p className="font-semibold">Persona Denunciada #{index + 1}: {item.name || 'N/A'}</p>
                                     <p>Cargo: {item.position || 'N/A'}</p>
                                     <p>Tipo: {item.employeeType || 'N/A'}</p>
                                     {item.employeeType === 'Trabajador de otra empresa' && (
                                         <p>Empleador: {item.employerName || 'N/A'}</p>
                                     )}
                                 </div>
                            ))}
                        </div>
                    </div>
                );
            }
            // Logic for other array types
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
                                    {['accusedPersons'].includes(field.type) ? renderFieldValue(field) : (
                                         <dd className="col-span-2 text-slate-700 font-medium flex items-center justify-between">
                                             <span>{renderFieldValue(field)}</span>
                                             {/* ... (resto de los botones de edición) ... */}
                                         </dd>
                                     )}
                                 </div>
                            ))}
                        </dl>
                    </div>
                ))}
            </div>
            {fieldToEdit && ( <EditFieldModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} field={fieldToEdit} onSave={handleEditSave} /> )}
            <AddItemModal
                isOpen={credentialModalOpen}
                onClose={() => setCredentialModalOpen(false)}
                title="Credenciales para Denunciados"
                hideSubmit={true}
            >
                {() => (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600">Copie y entregue estas credenciales de forma segura a cada persona denunciada.</p>
                        {generatedCredentials.map(cred => (
                            <div key={cred.accessCode} className="p-3 bg-slate-100 rounded-md">
                                <p className="font-bold text-slate-800">{cred.name}</p>
                                <p className="text-sm">Código de Acceso: <span className="font-mono text-indigo-600">{cred.accessCode}</span></p>
                                <p className="text-sm">Contraseña: <span className="font-mono text-indigo-600">{cred.password}</span></p>
                            </div>
                        ))}
                    </div>
                )}
            </AddItemModal>
        </Card>
    );
};

export default DetailsTab;
