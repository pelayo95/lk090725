// src/pages/admin/settings/DocumentationSettings.jsx
import React, { useState } from 'react';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Card, Button, Input, ConfirmationModal } from '../../../components/common';
import { AddItemModal } from '../../../components/common/AddItemModal';
import { Plus, Edit, Trash } from 'lucide-react';
import { uuidv4 } from '../../../utils/uuid';

const DocumentationSettings = () => {
    const { user } = useAuth();
    const { documentCategories, setDocumentCategories } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const companyCategories = documentCategories[user.companyId] || [];

    const handleSaveCategory = (categoryData) => {
        let newCategories = [...companyCategories];
        if (editingCategory) {
            const index = newCategories.findIndex(c => c.id === editingCategory.id);
            newCategories[index] = { ...editingCategory, ...categoryData };
        } else {
            newCategories.push({ ...categoryData, id: `cat_${uuidv4()}` });
        }
        setDocumentCategories(prev => ({ ...prev, [user.companyId]: newCategories }));
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleDeleteCategory = () => {
        if (!categoryToDelete) return;
        // Opcional: verificar si algún documento usa esta categoría antes de borrar.
        const newCategories = companyCategories.filter(c => c.id !== categoryToDelete.id);
        setDocumentCategories(prev => ({ ...prev, [user.companyId]: newCategories }));
        setCategoryToDelete(null);
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Categorías de Documentos</h3>
                <Button onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}>
                    <Plus className="w-4 h-4"/> Crear Categoría
                </Button>
            </div>
            <p className="text-sm text-slate-500 mb-4">Crea y gestiona las carpetas o categorías donde se organizarán los documentos en el módulo de "Documentación".</p>
            <div className="space-y-2">
                {companyCategories.map(category => (
                    <div key={category.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                        <span className="font-medium">{category.name}</span>
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => { setEditingCategory(category); setIsModalOpen(true); }}><Edit className="w-4 h-4"/></Button>
                            <Button variant="ghost" className="text-red-500" onClick={() => setCategoryToDelete(category)}><Trash className="w-4 h-4"/></Button>
                        </div>
                    </div>
                ))}
            </div>
            <AddItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSaveCategory}
                title={editingCategory ? "Editar Categoría" : "Crear Nueva Categoría"}
                initialState={editingCategory || { name: '' }}
                isEditing={!!editingCategory}
            >
                {(formData, handleChange) => (
                    <Input label="Nombre de la Categoría" value={formData.name} onChange={e => handleChange('name', e.target.value)} required />
                )}
            </AddItemModal>
            {categoryToDelete && (
                <ConfirmationModal
                    isOpen={!!categoryToDelete}
                    onClose={() => setCategoryToDelete(null)}
                    onConfirm={handleDeleteCategory}
                    title={`Eliminar Categoría: ${categoryToDelete.name}`}
                >
                    <p>¿Está seguro de que desea eliminar esta categoría? Los documentos en esta categoría quedarán sin clasificar.</p>
                </ConfirmationModal>
            )}
        </Card>
    );
};

export default DocumentationSettings;
