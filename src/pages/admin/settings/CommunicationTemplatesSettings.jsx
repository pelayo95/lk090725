// src/pages/admin/settings/CommunicationTemplatesSettings.jsx
import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { Card, Button, Input, TextArea, ConfirmationModal, Select } from '../../../components/common';
import { AddItemModal } from '../../../components/common/AddItemModal';
import { Plus, Edit, Trash } from 'lucide-react';
import { uuidv4 } from '../../../utils/uuid';

const triggerOptions = [
    { value: 'manual', label: 'Manual (Sin activador automático)' },
    { value: 'case_created', label: 'Al crearse un nuevo caso' },
    { value: 'investigators_assigned', label: 'Al asignar investigadores por primera vez' },
    { value: 'case_closed', label: 'Al cerrar un caso' },
];

const CommunicationTemplatesSettings = () => {
    const { user } = useAuth();
    const { communicationTemplates, setCommunicationTemplates } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [templateToDelete, setTemplateToDelete] = useState(null);

    const companyTemplates = communicationTemplates[user.companyId] || [];

    const handleSaveTemplate = (templateData) => {
        const newCompanyTemplates = [...companyTemplates];
        if (editingTemplate) {
            const index = newCompanyTemplates.findIndex(t => t.id === editingTemplate.id);
            newCompanyTemplates[index] = { ...editingTemplate, ...templateData };
        } else {
            newCompanyTemplates.push({ ...templateData, id: `tpl_${uuidv4()}` });
        }
        setCommunicationTemplates(prev => ({ ...prev, [user.companyId]: newCompanyTemplates }));
        setIsModalOpen(false);
        setEditingTemplate(null);
    };

    const handleDeleteTemplate = () => {
        if (!templateToDelete) return;
        const newCompanyTemplates = companyTemplates.filter(t => t.id !== templateToDelete.id);
        setCommunicationTemplates(prev => ({ ...prev, [user.companyId]: newCompanyTemplates }));
        setTemplateToDelete(null);
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Plantillas de Comunicación</h3>
                <Button onClick={() => { setEditingTemplate(null); setIsModalOpen(true); }}>
                    <Plus className="w-4 h-4"/> Crear Plantilla
                </Button>
            </div>
            <div className="space-y-3">
                {companyTemplates.map(template => (
                    <div key={template.id} className="p-4 bg-slate-50 rounded-md border">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold text-slate-700">{template.name}</p>
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => { setEditingTemplate(template); setIsModalOpen(true); }}>
                                    <Edit className="w-4 h-4"/>
                                </Button>
                                <Button variant="ghost" className="text-red-500" onClick={() => setTemplateToDelete(template)}>
                                    <Trash className="w-4 h-4"/>
                                </Button>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 italic">Punto de activación: {triggerOptions.find(t => t.value === template.triggerPoint)?.label || 'Manual'}</p>
                        <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap p-2 bg-white rounded">{template.content}</p>
                    </div>
                ))}
            </div>
            <AddItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSaveTemplate}
                title={editingTemplate ? "Editar Plantilla" : "Crear Plantilla"}
                initialState={editingTemplate || { name: '', content: '', triggerPoint: 'manual' }}
                isEditing={!!editingTemplate}
            >
                {(formData, handleChange) => (
                    <>
                        <Input label="Nombre de la Plantilla" value={formData.name} onChange={e => handleChange('name', e.target.value)} required />
                        <Select label="Punto de Activación Automático" value={formData.triggerPoint} onChange={e => handleChange('triggerPoint', e.target.value)}>
                            {triggerOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </Select>
                        <TextArea label="Contenido del Mensaje" value={formData.content} onChange={e => handleChange('content', e.target.value)} required rows={6} />
                    </>
                )}
            </AddItemModal>
            {templateToDelete && (
                 <ConfirmationModal
                    isOpen={!!templateToDelete}
                    onClose={() => setTemplateToDelete(null)}
                    onConfirm={handleDeleteTemplate}
                    title={`Eliminar Plantilla: ${templateToDelete.name}`}
                >
                    <p>¿Está seguro de que desea eliminar esta plantilla? Esta acción no se puede deshacer.</p>
                </ConfirmationModal>
            )}
        </Card>
    );
};

export default CommunicationTemplatesSettings;
