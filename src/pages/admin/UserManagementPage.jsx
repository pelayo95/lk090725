// src/pages/admin/UserManagementPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Card, Button, Input, Select, ConfirmationModal } from '../../components/common';
import { AddItemModal } from '../../components/common/AddItemModal';
import { Plus, Trash } from 'lucide-react';
import { uuidv4 } from '../../../utils/uuid';

const UserManagementPage = () => {
    const { user, allUsers, setAllUsers } = useAuth();
    const { roles } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const { addToast } = useNotification();
    
    const companyUsers = allUsers.filter(u => u.companyId === user.companyId);
    const companyRoles = roles[user.companyId] || [];

    const handleCreateUser = (newUserData) => {
        // ... (lógica de creación sin cambios)
    };

    const handleDeleteUser = () => {
        if (!userToDelete) return;
        setAllUsers(prev => prev.filter(u => u.uid !== userToDelete.uid));
        addToast("Usuario eliminado con éxito.", "success");
        setUserToDelete(null);
    };

    const getRoleName = (roleId) => {
        const role = companyRoles.find(r => r.id === roleId);
        return role ? role.name : 'Rol no encontrado';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h1>
                {user.permissions.config_usuarios_puede_crear && (
                    <Button onClick={() => setIsModalOpen(true)} variant="primary">
                        <Plus className="w-4 h-4"/> Crear Usuario
                    </Button>
                )}
            </div>
            <Card className="p-0 overflow-x-auto">
                 <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nombre</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Rol</th>
                            <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companyUsers.map(u => (
                            <tr key={u.uid} className="bg-white border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                                <td className="px-6 py-4">{u.email}</td>
                                <td className="px-6 py-4 capitalize">{getRoleName(u.roleId)}</td>
                                <td className="px-6 py-4 text-right">
                                    {user.permissions.config_usuarios_puede_eliminar && u.uid !== user.uid && (
                                        <Button variant="ghost" className="text-red-500" onClick={() => setUserToDelete(u)}>
                                            <Trash className="w-4 h-4" />
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </Card>
            {/* ... (código del AddItemModal sin cambios) */}
            {userToDelete && (
                <ConfirmationModal
                    isOpen={!!userToDelete}
                    onClose={() => setUserToDelete(null)}
                    onConfirm={handleDeleteUser}
                    title={`Eliminar Usuario: ${userToDelete.name}`}
                >
                    <p>¿Está seguro de que desea eliminar a este usuario? Esta acción no se puede deshacer.</p>
                </ConfirmationModal>
            )}
        </div>
    );
};

export default UserManagementPage;
