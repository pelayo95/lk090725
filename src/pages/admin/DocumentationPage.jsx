// src/pages/admin/DocumentationPage.jsx
import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button, Select, ConfirmationModal, Input } from '../../components/common';
import { AddItemModal } from '../../components/common/AddItemModal';
import { getUserNameById, userHasPermission } from '../../utils/userUtils';
import Accordion from '../../components/common/Accordion';
import { Plus, Trash, Download, Folder } from 'lucide-react';
import { uuidv4 } from '../../utils/uuid';

const DocumentationPage = () => {
    const { user } = useAuth();
    const { documentCategories, companyDocuments, setCompanyDocuments } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [docToDelete, setDocToDelete] = useState(null);

    const categories = useMemo(() => documentCategories[user.companyId] || [], [documentCategories, user.companyId]);
    const documents = useMemo(() => companyDocuments[user.companyId] || [], [companyDocuments, user.companyId]);

    const handleSaveDoc = (docData) => {
        const newDoc = {
            ...docData,
            id: `doc_${uuidv4()}`,
            uploadedAt: new Date().toISOString(),
            uploadedBy: user.uid,
            url: "#" // Simulación
        };
        const newDocs = [...documents, newDoc];
        setCompanyDocuments(prev => ({ ...prev, [user.companyId]: newDocs }));
        setIsModalOpen(false);
    };

    const handleDeleteDoc = () => {
        if (!docToDelete) return;
        const newDocs = documents.filter(d => d.id !== docToDelete.id);
        setCompanyDocuments(prev => ({ ...prev, [user.companyId]: newDocs }));
        setDocToDelete(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Documentación General</h1>
                {userHasPermission(user, 'documentacion_puede_gestionar') && (
                    <Button onClick={() => setIsModalOpen(true)} variant="primary">
                        <Plus className="w-4 h-4"/> Subir Documento
                    </Button>
                )}
            </div>
            <div className="space-y-4">
                {categories.map(category => {
                    const docsInCategory = documents.filter(d => d.categoryId === category.id);
                    return (
                        <Accordion 
                            key={category.id}
                            title={`${category.name} (${docsInCategory.length})`}
                            titleIcon={<Folder className="w-5 h-5"/>}
                            defaultOpen={true}
                        >
                            <div className="p-4 space-y-3">
                                {docsInCategory.length > 0 ? docsInCategory.map(doc => (
                                    <div key={doc.id} className="flex justify-between items-center p-3 bg-white rounded-md border">
                                        <div>
                                            <p className="font-medium text-slate-800">{doc.name}</p>
                                            <p className="text-xs text-slate-500">Subido por {getUserNameById(doc.uploadedBy, useAuth().allUsers)} el {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="secondary" size="sm" onClick={() => alert('Función de descarga no implementada.')}>
                                                <Download className="w-4 h-4"/>
                                            </Button>
                                            {userHasPermission(user, 'documentacion_puede_gestionar') && (
                                                <Button variant="ghost" className="text-red-500" size="sm" onClick={() => setDocToDelete(doc)}>
                                                    <Trash className="w-4 h-4"/>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )) : <p className="text-sm text-slate-400 text-center">No hay documentos en esta categoría.</p>}
                            </div>
                        </Accordion>
                    )
                })}
            </div>
            <AddItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSaveDoc}
                title="Subir Nuevo Documento"
                initialState={{ name: '', categoryId: categories[0]?.id || '' }}
            >
                {(formData, handleChange) => (
                    <>
                        <Input label="Nombre del Documento" value={formData.name} onChange={e => handleChange('name', e.target.value)} required />
                        <Select label="Categoría" value={formData.categoryId} onChange={e => handleChange('categoryId', e.target.value)} required>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </Select>
                        <Input type="file" required />
                    </>
                )}
            </AddItemModal>
            {docToDelete && (
                <ConfirmationModal
                    isOpen={!!docToDelete}
                    onClose={() => setDocToDelete(null)}
                    onConfirm={handleDeleteDoc}
                    title={`Eliminar Documento: ${docToDelete.name}`}
                >
                    <p>¿Está seguro de que desea eliminar este documento?</p>
                </ConfirmationModal>
            )}
        </div>
    );
};

export default DocumentationPage;
