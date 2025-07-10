// src/pages/admin/case-details/FilesTab.jsx
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { Card, Button, Select, TextArea, ConfirmationModal } from '../../../components/common';
import { AddItemModal } from '../../../components/common/AddItemModal';
import { getUserNameById } from '../../../utils/userUtils';
import { uuidv4 } from '../../../utils/uuid';
import { Plus, Edit, Trash, Paperclip } from 'lucide-react';

const FilesTab = ({ complaint }) => {
    const { user, allUsers } = useAuth();
    const { updateComplaint } = useData();
    const { addToast } = useNotification();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fileToModify, setFileToModify] = useState(null);
    const [fileToDelete, setFileToDelete] = useState(null);

    // Nuevas categorías de archivos
    const orderedCategories = [
        "Presentados por denunciante",
        "Presentados por denunciado(s)",
        "Presentados por testigos",
        "Contrato y anexos denunciante",
        "Contrato y anexos denunciados",
        "Recepción de reglamento interno",
        "Otra documentación asociada a denunciante",
        "Otra documentación asociada a denunciada",
        "Otros documentos"
    ];

    const groupedFiles = useMemo(() => {
        const groups = orderedCategories.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {});
        (complaint.caseFiles || []).forEach(file => {
            const category = file.category || 'Otros documentos';
            if (groups[category]) {
                groups[category].push(file);
            } else {
                groups['Otros documentos'].push(file);
            }
        });
        return groups;
    }, [complaint.caseFiles]);

    // ... (lógica de handleSaveFile, handleAddFile, confirmDeleteFile, etc. sin cambios)

    return (
        <Card>
            {/* ... (código del header sin cambios) */}
            {/* El modal ahora usará las nuevas categorías */}
            <AddItemModal
                isOpen={isModalOpen}
                onClose={() => {setIsModalOpen(false); setFileToModify(null);}}
                onSubmit={fileToModify ? handleSaveFile : handleAddFile}
                title={fileToModify ? "Editar Archivo" : "Añadir Nuevo Archivo"}
                initialState={fileToModify || { fileName: '', description: '', category: orderedCategories[0] }}
                isEditing={!!fileToModify}
            >
                {(formData, handleChange) => {
                    const handleFileChange = (e) => {
                        if (e.target.files.length > 0) {
                            handleChange('fileName', e.target.files[0].name);
                        }
                    };

                    return (
                        <>
                            <input type="file" onChange={handleFileChange} required={!fileToModify} disabled={!!fileToModify} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                            <Select label="Categoría" value={formData.category} onChange={e => handleChange('category', e.target.value)} required>
                                {orderedCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </Select>
                            <TextArea label="Descripción" value={formData.description} onChange={e => handleChange('description', e.target.value)} required />
                        </>
                    );
                }}
            </AddItemModal>
            {/* ... (código del modal de confirmación sin cambios) */}
        </Card>
    );
};

export default FilesTab;
