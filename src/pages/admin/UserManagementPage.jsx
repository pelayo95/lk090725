// src/pages/admin/UserManagementPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Card, Button, Input, Select } from '../../components/common';
import { AddItemModal } from '../../components/common/AddItemModal';
import { Plus } from 'lucide-react';
import { uuidv4 } from '../../utils/uuid';

const UserManagementPage = () => {
    const { user, allUsers, setAllUsers } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { addToast } = useNotification();
    
    const companyUsers = allUsers.filter(u => u.companyId === user.companyId);

    const handleCreateUser = (newUserData) => {
        const newUser = {
            ...newUserData,
            uid: uuidv4(),
            companyId: user.companyId,
            lastVisited: {},
        };
        setAllUsers(prev => [...prev, newUser]);
        addToast("Usuario creado con éxito", "success");
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h1>
                <Button onClick={() => setIsModalOpen(true)} variant="primary">
                    <Plus className="w-4 h-4"/> Crear Usuario
                </Button>
            </div>
            <Card className="p-0 overflow-x-auto">
                 <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nombre</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Rol</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companyUsers.map(u => (
                            <tr key={u.uid} className="bg-white border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                                <td className="px-6 py-4">{u.email}</td>
                                <td className="px-6 py-4 capitalize">{u.role}</td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </Card>
            <AddItemModal
                 isOpen={isModalOpen}
                 onClose={() => setIsModalOpen(false)}
                 onSubmit={handleCreateUser}
                 title="Crear Nuevo Usuario"
                 initialState={{ name: '', email: '', role: 'investigador', password: 'password' }}
            >
                {(formData, handleChange) => (
                     <>
                        <Input label="Nombre Completo" id="new-user-name" value={formData.name} onChange={e => handleChange('name', e.target.value)} required />
                        <Input label="Email" id="new-user-email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} required />
                        <Select label="Rol" id="new-user-role" value={formData.role} onChange={e => handleChange('role', e.target.value)}>
                            <option value="investigador">Investigador</option>
                            <option value="admin">Administrador</option>
                        </Select>
                        <Input label="Contraseña Temporal" id="new-user-pass" type="text" value={formData.password} onChange={e => handleChange('password', e.target.value)} required />
                    </>
                )}
            </AddItemModal>
        </div>
    );
};

export default UserManagementPage;
