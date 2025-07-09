// src/pages/boss/CreateAdminForm.jsx
import React, { useState } from 'react';
import { Button, Input } from '../../components/common';
import RutInput from '../../components/form-fields/RutInput';
import { useNotification } from '../../contexts/NotificationContext';

const CreateAdminForm = ({ onCancel, onCreate }) => {
    const [adminData, setAdminData] = useState({});
    const { addToast } = useNotification();
    const handleAdminChange = (field, value) => setAdminData(prev => ({...prev, [field]: value}));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!adminData.name || !adminData.email || !adminData.password) {
            addToast("Nombre, Email y Contraseña son requeridos para el admin.", "error");
            return;
        }
        onCreate(adminData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nombre Completo" value={adminData.name || ''} onChange={e => handleAdminChange('name', e.target.value)} required />
                <RutInput label="RUT" value={adminData.rut || ''} onChange={e => handleAdminChange('rut', e.target.value)} />
                <Input label="Cargo" value={adminData.position || ''} onChange={e => handleAdminChange('position', e.target.value)} />
                <Input label="Teléfono" value={adminData.phone || ''} onChange={e => handleAdminChange('phone', e.target.value)} />
                <Input label="Email (para login)" type="email" value={adminData.email || ''} onChange={e => handleAdminChange('email', e.target.value)} required />
                <Input label="Contraseña" type="password" value={adminData.password || ''} onChange={e => handleAdminChange('password', e.target.value)} required />
            </div>
             <div className="flex justify-end gap-3 pt-4">
                <Button type="button" onClick={onCancel} variant="secondary">Cancelar</Button>
                <Button type="submit" variant="primary">Crear Administrador</Button>
            </div>
        </form>
    )
}

export default CreateAdminForm;
