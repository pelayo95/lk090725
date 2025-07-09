// src/pages/boss/CompanyEditPanel.jsx
import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Modal, Button, Card, ConfirmationModal } from '../../components/common';
import { setNestedValue } from '../../utils/objectUtils';
import CompanyForm from './CompanyForm';
import CreateAdminForm from './CreateAdminForm';
import { Plus, Trash } from 'lucide-react';
import { uuidv4 } from '../../utils/uuid';

const CompanyEditPanel = ({ company, onClose }) => {
    const { updateCompany } = useData();
    const { allUsers, setAllUsers } = useAuth();
    const { addToast } = useNotification();
    
    const [companyData, setCompanyData] = useState(company);
    const [isAddingAdmin, setIsAddingAdmin] = useState(false);
    const [adminToDelete, setAdminToDelete] = useState(null);

    useEffect(() => { setCompanyData(company); }, [company]);

    const companyAdmins = allUsers.filter(u => u.companyId === company.id && u.role === 'admin');

    const handleSave = () => {
        updateCompany(company.id, companyData);
        onClose();
    };
    
    const handleDataChange = (path, value) => {
        setCompanyData(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            setNestedValue(newState, path, value);
            return newState;
        })
    }
    
    const handleAddAdmin = (newAdminData) => {
        const newAdmin = { ...newAdminData, uid: uuidv4(), companyId: company.id, role: 'admin' };
        setAllUsers(prev => [...prev, newAdmin]);
        addToast("Nuevo administrador añadido.", "success");
        setIsAddingAdmin(false);
    };
    
    const handleConfirmDeleteAdmin = () => {
        if (!adminToDelete) return;
        setAllUsers(prevUsers => prevUsers.filter(u => u.uid !== adminToDelete.uid));
        addToast("Administrador eliminado con éxito", "success");
        setAdminToDelete(null);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Editando: ${company.name}`}>
            <div className="space-y-6">
               <Card>
                 <CompanyForm data={companyData} onDataChange={handleDataChange} />
               </Card>
               <Card>
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="text-md font-semibold text-indigo-700">Administradores de la Empresa</h4>
                        <Button variant="secondary" onClick={() => setIsAddingAdmin(!isAddingAdmin)}><Plus className="w-4 h-4"/>Añadir Admin</Button>
                    </div>
                     <ul className="divide-y divide-slate-200">
                        {companyAdmins.map(admin => (
                            <li key={admin.uid} className="py-2 flex justify-between items-center">
                                <div><p className="font-semibold text-sm">{admin.name}</p><p className="text-xs text-slate-500">{admin.email}</p></div>
                                <Button variant="ghost" className="p-1 h-auto text-red-500 hover:bg-red-100" onClick={() => setAdminToDelete(admin)}><Trash className="w-4 h-4"/></Button>
                            </li>
                        ))}
                    </ul>
                </Card>
                {isAddingAdmin && <Card><h4 className="text-md font-semibold text-indigo-700 mb-3">Nuevo Administrador</h4><CreateAdminForm onCancel={() => setIsAddingAdmin(false)} onCreate={handleAddAdmin} /></Card>}
                 <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" onClick={onClose} variant="secondary">Cerrar</Button>
                    <Button type="button" variant="primary" onClick={handleSave}>Guardar Cambios</Button>
                </div>
            </div>
            {adminToDelete && <ConfirmationModal isOpen={!!adminToDelete} onClose={() => setAdminToDelete(null)} onConfirm={handleConfirmDeleteAdmin} title="Confirmar Eliminación">
                <p>¿Está seguro que desea eliminar al administrador <span className="font-bold">{adminToDelete.name}</span>? Esta acción no se puede deshacer.</p>
            </ConfirmationModal>}
        </Modal>
    );
};

export default CompanyEditPanel;
