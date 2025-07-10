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

    const orderedCategories = ["prueba denunciante", "prueba denunciado", "contexto", "documentación laboral", "otros"];

    const groupedFiles = useMemo(() => {
        const groups = orderedCategories.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {});
        (complaint.caseFiles || []).forEach(file => {
            const category = file.category || 'otros';
            if (groups[category]) {
                groups[category].push(file);
            } else {
                groups['otros'].push(file);
            }
        });
        return groups;
    }, [complaint.caseFiles]);

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
                {user.permissions.archivos_puede_subir && (
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
                                    {category.replace(/_/g, ' ')}
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
                                                {user.permissions.archivos_puede_editar_clasificar && (
                                                    <Button variant="ghost" className="p-1 h-auto" onClick={() => handleEditClick(file)}><Edit className="w-4 h-4 text-slate-500"/></Button>
                                                )}
                                                {user.permissions.archivos_puede_eliminar && (
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
                initialState={fileToModify || { fileName: '', description: '', category: 'prueba denunciante' }}
                isEditing={!!fileToModify}
            >
                {(formData, handleChange) => {
                    const fileCategories = ["prueba denunciante", "prueba denunciado", "contexto", "documentación laboral", "otros"];
                    
                    const handleFileChange = (e) => {
                        if (e.target.files.length > 0) {
                            handleChange('fileName', e.target.files[0].name);
                        }
                    };

                    return (
                        <>
                            <input type="file" onChange={handleFileChange} required={!fileToModify} disabled={!!fileToModify} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                            <Select label="Categoría" value={formData.category} onChange={e => handleChange('category', e.target.value)} required>
                                {fileCategories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ')}</option>)}
                            </Select>
                            <TextArea label="Descripción" value={formData.description} onChange={e => handleChange('description', e.target.value)} required />
                        </>
                    );
                }}
            </AddItemModal>
            
            {fileToDelete && (
                <ConfirmationModal
                    isOpen={!!fileToDelete}
                    onClose={() => setFileToDelete(null)}
                    onConfirm={confirmDeleteFile}
                    title="Confirmar Eliminación"
                >
                    <p>¿Está seguro de que desea eliminar el archivo <span className="font-bold">{fileToDelete.fileName}</span>? Esta acción no se puede deshacer.</p>
                </ConfirmationModal>
            )}
        </Card>
    );
};

export default FilesTab;
