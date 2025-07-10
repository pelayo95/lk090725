// src/pages/admin/settings/RoleManagementPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { Card, Button, ConfirmationModal, Tooltip } from '../../../components/common';
import { Plus, Edit, Trash } from 'lucide-react';
import RoleEditModal from './RoleEditModal';
import { uuidv4 } from '../../../utils/uuid';

const RoleManagementPage = () => {
    const { user } = useAuth();
    const { roles, setRoles } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [roleToDelete, setRoleToDelete] = useState(null);

    const companyRoles = roles[user.companyId] || [];

    const handleSaveRole = (roleData) => {
        const newCompanyRoles = [...companyRoles];
        if (editingRole) {
            const index = newCompanyRoles.findIndex(r => r.id === editingRole.id);
            newCompanyRoles[index] = { ...editingRole, ...roleData };
        } else {
            newCompanyRoles.push({ ...roleData, id: `rol_${uuidv4()}` });
        }
        setRoles(prev => ({ ...prev, [user.companyId]: newCompanyRoles }));
        setIsModalOpen(false);
        setEditingRole(null);
    };

    const handleDeleteRole = () => {
        if (!roleToDelete) return;
        const newCompanyRoles = companyRoles.filter(r => r.id !== roleToDelete.id);
        setRoles(prev => ({ ...prev, [user.companyId]: newCompanyRoles }));
        setRoleToDelete(null);
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Gestión de Roles</h3>
                <Button onClick={() => { setEditingRole(null); setIsModalOpen(true); }}>
                    <Plus className="w-4 h-4"/> Crear Rol
                </Button>
            </div>
            <div className="space-y-2">
                {companyRoles.map(role => (
                    <div key={role.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                        <span className="font-medium">{role.name} {role.isDefaultAdmin && "(Rol por Defecto)"}</span>
                        <div className="flex gap-2">
                            <Tooltip text={role.isDefaultAdmin ? "El rol de Administrador por defecto no se puede editar." : "Editar Rol"}>
                                <div className={`${role.isDefaultAdmin ? 'cursor-not-allowed' : ''}`}>
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => { setEditingRole(role); setIsModalOpen(true); }}
                                        disabled={role.isDefaultAdmin}
                                    >
                                        <Edit className="w-4 h-4"/>
                                    </Button>
                                </div>
                            </Tooltip>
                            {!role.isDefaultAdmin && (
                                <Button variant="ghost" className="text-red-500" onClick={() => setRoleToDelete(role)}>
                                    <Trash className="w-4 h-4"/>
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {isModalOpen && (
                <RoleEditModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveRole}
                    role={editingRole}
                />
            )}
            {roleToDelete && (
                <ConfirmationModal
                    isOpen={!!roleToDelete}
                    onClose={() => setRoleToDelete(null)}
                    onConfirm={handleDeleteRole}
                    title={`Eliminar Rol: ${roleToDelete.name}`}
                >
                    <p>¿Está seguro de que desea eliminar este rol? Los usuarios asignados a este rol perderán sus permisos. Esta acción no se puede deshacer.</p>
                </ConfirmationModal>
            )}
        </Card>
    );
};

export default RoleManagementPage;
