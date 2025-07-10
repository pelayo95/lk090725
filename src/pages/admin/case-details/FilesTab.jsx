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

    // ... (lógica de groupedFiles, handleSaveFile, handleAddFile, confirmDeleteFile sin cambios)

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Gestión de Archivos</h3>
                {user.permissions.archivos_puede_subir && (
                    <Button onClick={() => { setFileToModify(null); setIsModalOpen(true); }} variant="primary">
                        <Plus className="w-4 h-4"/> Añadir Archivo
                    </Button>
                )}
            </div>
            <div className="space-y-6">
                {(complaint.caseFiles || []).length > 0 ? (
                    // ... (lógica de renderizado de archivos)
                    <div className="flex gap-1">
                        {user.permissions.archivos_puede_editar_clasificar && (
                            <Button variant="ghost" className="p-1 h-auto" onClick={() => { setFileToModify(file); setIsModalOpen(true); }}><Edit className="w-4 h-4 text-slate-500"/></Button>
                        )}
                        {user.permissions.archivos_puede_eliminar && (
                            <Button variant="ghost" className="p-1 h-auto" onClick={() => setFileToDelete(file)}><Trash className="w-4 h-4 text-red-500"/></Button>
                        )}
                    </div>
                ) : (
                    <p className="text-center text-slate-500 py-4">No hay archivos adjuntos a este caso.</p>
                )}
            </div>
            {/* ... (Modales AddItemModal y ConfirmationModal sin cambios en su renderizado) */}
        </Card>
    );
};

export default FilesTab;
