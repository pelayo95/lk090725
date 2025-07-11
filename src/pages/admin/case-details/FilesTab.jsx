// src/pages/admin/case-details/FilesTab.jsx
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { Card, Button, Select, TextArea, ConfirmationModal, Input } from '../../../components/common';
import { AddItemModal } from '../../../components/common/AddItemModal';
import { getUserNameById, userHasPermission } from '../../../utils/userUtils';
import { uuidv4 } from '../../../utils/uuid';
import { Plus, Edit, Trash, Paperclip } from 'lucide-react';

const FilesTab = ({ complaint }) => {
    const { user, allUsers } = useAuth();
    const { updateComplaint } = useData();
    const { addToast } = useNotification();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fileToModify, setFileToModify] = useState(null);
    const [fileToDelete, setFileToDelete] = useState(null);

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
    }, [complaint.caseFiles, orderedCategories]);

    const handleSaveFile = (itemData) => {
        const updatedFiles = complaint.caseFiles.map(f => f.id === itemData.id ? { ...f, ...itemData } : f);
        const newAuditLogEntry = { id: uuidv4(), action: `Archivo editado: "${itemData.fileName}"`, userId: user.uid, timestamp: new Date().toISOString() };
        updateComplaint(complaint.id, { caseFiles: updatedFiles, auditLog: [...complaint.auditLog, newAuditLogEntry] }, user);
        addToast("Archivo actualizado", "success");
        setFileToModify(null);
        setIsModalOpen(false);
    };
    
    const handleAddFile = (newFileData) => {
        const newFile = {
            id: uuidv4(),
            ...newFileData,
            uploadedByUserId: user.uid,
            uploadedAt: new Date().toISOString(),
        };
        const newAuditLogEntry = {
            id: uuidv4(),
            action: `Nuevo archivo subido: "${newFile.fileName}"`,
            userId: user.uid,
            timestamp: new Date().toISOString()
        };
        const updatedFiles = [...(complaint.caseFiles || []), newFile];
        updateComplaint(complaint.id, { 
            caseFiles: updatedFiles, 
            auditLog: [...complaint.auditLog, newAuditLogEntry] 
        }, user);
        addToast("Archivo añadido", "success");
        setIsModalOpen(false);
        setFileToModify(null);
    };

    const confirmDeleteFile = () => {
        if (!fileToDelete) return;

        const fileName = fileToDelete.fileName;
        const updatedFiles = complaint.caseFiles.filter(f => f.id !== fileToDelete.id);
        const newAuditLogEntry = {
            id: uuidv4(),
            action: `Archivo eliminado: "${fileName}"`,
            userId: user.uid,
            timestamp: new Date().toISOString()
        };
        updateComplaint(complaint.id, {
            caseFiles: updatedFiles,
            auditLog: [...complaint.auditLog, newAuditLogEntry]
        }, user);
        addToast("Archivo eliminado", "success");
        setFileToDelete(null);
    };
    
    const handleAddClick = () => {
        setFileToModify(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (file) => {
        setFileToModify(file);
        setIsModalOpen(true);
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Gestión de Archivos</h3>
                {userHasPermission(user, 'archivos_puede_subir') && (
                    <Button onClick={handleAddClick} variant="primary">
                        <Plus className="w-4 h-4"/> Añadir Archivo
                    </Button>
                )}
            </div>
            <div className="space-y-6">
                {(complaint.caseFiles || []).length > 0 ? (
                    orderedCategories.map(category => {
                        const filesInCategory = groupedFiles[category];
                        if (!filesInCategory || filesInCategory.length === 0) {
                            return null;
                        }
                        return (
                            <div key={category}>
                                <h4 className="text-md font-semibold text-indigo-700 mb-3 capitalize border-b pb-2">
                                    {category}
                                </h4>
                                <div className="space-y-3">
                                    {filesInCategory.map(file => (
                                        <div key={file.id} className="p-4 border rounded-lg bg-white flex items-start gap-4">
                                            <Paperclip className="w-6 h-6 text-slate-400 mt-1 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="font-semibold text-slate-800">{file.fileName}</p>
                                                <p className="text-sm text-slate-600 mt-1">{file.description}</p>
                                                <p className="text-xs text-slate-400 mt-2">
                                                    Subido por {getUserNameById(file.uploadedByUserId, allUsers)} el {new Date(file.uploadedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                             <div className="flex gap-1">
                                                {userHasPermission(user, 'archivos_puede_editar_clasificar') && (
                                                    <Button variant="ghost" className="p-1 h-auto" onClick={() => handleEditClick(file)}><Edit className="w-4 h-4 text-slate-500"/></Button>
                                                )}
                                                {userHasPermission(user, 'archivos_puede_eliminar') && (
                                                    <Button variant="ghost" className="p-1 h-auto" onClick={() => setFileToDelete(file)}><Trash className="w-4 h-4 text-red-500"/></Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center text-slate-500 py-4">No hay archivos adjuntos a este caso.</p>
                )}
            </div>

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
                            <Input type="file" onChange={handleFileChange} required={!fileToModify} disabled={!!fileToModify} />
                            <Select label="Categoría" value={formData.category} onChange={e => handleChange('category', e.target.value)} required>
                                {orderedCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </Select>
                            <TextArea label="Descripción" value={formData.description} onChange={
