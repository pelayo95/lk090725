// src/pages/admin/settings/UserEditModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select } from '../../../components/common';
import { useAuth } from '../../../contexts/AuthContext';

const UserEditModal = ({ isOpen, onClose, onSave, user, roles }) => {
    const { user: currentUser } = useAuth(); // El usuario logueado para chequear permisos
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                roleId: user.roleId || '',
            });
        }
    }, [user]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(user.uid, formData);
        onClose();
    };

    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Editar Usuario: ${user.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Nombre Completo"
                    id="edit-user-name"
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    required
                />
                <Input
                    label="Email"
                    id="edit-user-email"
                    type="email"
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    required
                />
                {currentUser.permissions.config_usuarios_puede_asignar_rol && (
                    <Select
                        label="Rol"
                        id="edit-user-role"
                        value={formData.roleId}
                        onChange={e => handleChange('roleId', e.target.value)}
                        disabled={user.uid === currentUser.uid} // Previene que un admin cambie su propio rol
                    >
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </Select>
                )}
                 {user.uid === currentUser.uid && (
                    <p className="text-xs text-slate-500">No puede cambiar su propio rol.</p>
                 )}

                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                    <Button type="button" onClick={onClose} variant="secondary">Cancelar</Button>
                    <Button type="submit" variant="primary">Guardar Cambios</Button>
                </div>
            </form>
        </Modal>
    );
};

export default UserEditModal;
