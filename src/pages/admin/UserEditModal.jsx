// src/pages/admin/UserEditModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select, TextArea } from '../../components/common';
import RutInput from '../../components/form-fields/RutInput';
import { useAuth } from '../../contexts/AuthContext';
import { Paperclip, Plus, Trash } from 'lucide-react';
import { uuidv4 } from '../../utils/uuid';

const UserEditModal = ({ isOpen, onClose, onSave, user, roles }) => {
    const { user: currentUser } = useAuth();
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                rut: user.rut || '',
                position: user.position || '',
                specializedTraining: user.specializedTraining || '',
                trainingDocuments: user.trainingDocuments || [],
                roleId: user.roleId || '',
            });
        }
    }, [user]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            const newFile = {
                id: `doc_${uuidv4()}`,
                fileName: e.target.files[0].name,
                uploadedAt: new Date().toISOString()
            };
            handleChange('trainingDocuments', [...formData.trainingDocuments, newFile]);
        }
    };

    const handleRemoveFile = (fileId) => {
        const updatedDocs = formData.trainingDocuments.filter(doc => doc.id !== fileId);
        handleChange('trainingDocuments', updatedDocs);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(user.uid, formData);
        onClose();
    };

    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Editar Usuario: ${user.firstName} ${user.lastName}`}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* --- SECCIÓN DE DATOS PERSONALES --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Nombre" value={formData.firstName} onChange={e => handleChange('firstName', e.target.value)} required />
                    <Input label="Apellido" value={formData.lastName} onChange={e => handleChange('lastName', e.target.value)} required />
                    <RutInput label="RUT" value={formData.rut} onChange={e => handleChange('rut', e.target.value)} />
                    <Input label="Cargo" value={formData.position} onChange={e => handleChange('position', e.target.value)} />
                    <Input label="Email (Login)" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} required className="md:col-span-2" />
                </div>

                {/* --- SECCIÓN DE ROL --- */}
                {currentUser.permissions.config_usuarios_puede_asignar_rol && (
                    <Select label="Rol" id="edit-user-role" value={formData.roleId} onChange={e => handleChange('roleId', e.target.value)} disabled={user.uid === currentUser.uid}>
                        {roles.map(role => (<option key={role.id} value={role.id}>{role.name}</option>))}
                    </Select>
                )}

                {/* --- SECCIÓN DE FORMACIÓN --- */}
                <div>
                    <TextArea label="Formación Especializada (Resumen)" value={formData.specializedTraining} onChange={e => handleChange('specializedTraining', e.target.value)} rows={3} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Antecedentes de Formación</label>
                    <div className="space-y-2">
                        {formData.trainingDocuments.map(doc => (
                            <div key={doc.id} className="flex items-center justify-between p-2 bg-slate-100 rounded-md">
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <Paperclip className="w-4 h-4" />
                                    <span>{doc.fileName}</span>
                                </div>
                                <Button type="button" variant="ghost" className="p-1 h-auto text-red-500" onClick={() => handleRemoveFile(doc.id)}>
                                    <Trash className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-2">
                        <label htmlFor="file-upload" className="cursor-pointer text-sm text-indigo-600 hover:underline inline-flex items-center gap-1">
                            <Plus className="w-4 h-4"/> Subir Antecedente
                        </label>
                        <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" onClick={onClose} variant="secondary">Cancelar</Button>
                    <Button type="submit" variant="primary">Guardar Cambios</Button>
                </div>
            </form>
        </Modal>
    );
};

export default UserEditModal;
