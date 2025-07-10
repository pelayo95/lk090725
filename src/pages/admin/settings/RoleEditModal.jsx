// src/pages/admin/settings/RoleEditModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select } from '../../../components/common';
import { allPermissions } from '../../../data/permissions';

const RoleEditModal = ({ isOpen, onClose, onSave, role }) => {
    const [name, setName] = useState('');
    const [permissions, setPermissions] = useState({});

    useEffect(() => {
        if (role) {
            setName(role.name);
            setPermissions(role.permissions || {});
        } else {
            setName('');
            setPermissions({}); // Start with no permissions for a new role
        }
    }, [role]);

    const handlePermissionChange = (key, value) => {
        setPermissions(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ name, permissions });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={role ? 'Editar Rol' : 'Crear Rol'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input label="Nombre del Rol" value={name} onChange={e => setName(e.target.value)} required />
                
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    <h4 className="text-md font-semibold text-slate-700">Permisos</h4>
                    {Object.entries(allPermissions).map(([key, description]) => {
                        if (key.includes('_alcance')) {
                            const options = key.includes('agenda') ? ['propia', 'empresa'] : ['todos', 'asignados', 'propios'];
                            return (
                                <Select
                                    key={key}
                                    label={description}
                                    value={permissions[key] || options[0]}
                                    onChange={e => handlePermissionChange(key, e.target.value)}
                                >
                                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </Select>
                            )
                        }
                        return (
                            <label key={key} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-md">
                                <input
                                    type="checkbox"
                                    checked={!!permissions[key]}
                                    onChange={e => handlePermissionChange(key, e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-slate-800">{description}</span>
                            </label>
                        )
                    })}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" onClick={onClose} variant="secondary">Cancelar</Button>
                    <Button type="submit" variant="primary">Guardar Rol</Button>
                </div>
            </form>
        </Modal>
    );
};

export default RoleEditModal;
