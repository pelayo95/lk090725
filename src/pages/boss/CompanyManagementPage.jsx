// src/pages/boss/CompanyManagementPage.jsx
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useConfig } from '../../contexts/ConfigContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Button, Card } from '../../components/common';
import { Plus } from 'lucide-react';
import { defaultConfig } from '../../config/defaultConfig';
import { uuidv4 } from '../../utils/uuid';
import CreateCompanyModal from './CreateCompanyModal';
import CompanyEditPanel from './CompanyEditPanel';
import { allPermissions } from '../../data/permissions';
import { permissionToFeatureMap } from '../../data/permissionFeatureMap'; // Nuevo import

// Helper para generar los permisos del admin por defecto, basado en el plan de la empresa.
const generateAdminPermissionsForPlan = (planFeatures) => {
  return Object.keys(allPermissions).reduce((acc, key) => {
    const featureKey = permissionToFeatureMap[key];
    
    // Si el permiso no depende de un plan (null) o si la funcionalidad está incluida en el plan, se otorga el permiso.
    if (featureKey === null || planFeatures[featureKey]) {
        if (key.includes('_alcance')) {
          acc[key] = key.includes('agenda') ? 'empresa' : 'todos';
        } else {
          acc[key] = true;
        }
    } else {
        // Si la funcionalidad no está en el plan, el permiso se deniega.
        acc[key] = false;
    }
    return acc;
  }, {});
};

const CompanyManagementPage = () => {
    const { companies, plans, setCompanies, setRoles } = useData();
    const { setAllUsers } = useAuth();
    const { addToast } = useNotification();
    const { updateCompanyConfig } = useConfig();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);

    const handleCreateCompany = (newCompanyData) => {
        const companyId = `empresa-${uuidv4().split('-')[0]}`;
        
        const newCompany = {
            id: companyId,
            status: 'activo',
            name: newCompanyData.name,
            legalName: newCompanyData.legalName,
            rut: newCompanyData.rut,
            abbreviation: newCompanyData.abbreviation,
            address: newCompanyData.address,
            planId: newCompanyData.planId,
            commercialContact: newCompanyData.commercialContact,
            adminEmail: newCompanyData.adminEmail,
        };
        
        const defaultAdminRoleId = `rol_admin_${companyId}`;

        // Encontrar las funcionalidades del plan seleccionado
        const selectedPlan = plans.find(p => p.id === newCompanyData.planId);
        const planFeatures = selectedPlan ? selectedPlan.features : {};

        // Crear el nuevo rol de Administrador con los permisos basados en el plan
        const newAdminRole = {
            id: defaultAdminRoleId,
            name: "Administrador General",
            isDefaultAdmin: true,
            permissions: generateAdminPermissionsForPlan(planFeatures),
        };

        const newAdminUser = {
            uid: uuidv4(),
            email: newCompanyData.adminEmail,
            password: newCompanyData.password,
            roleId: defaultAdminRoleId,
            companyId: companyId,
            name: newCompanyData.adminName,
            rut: newCompanyData.adminRut,
            position: newCompanyData.adminPosition,
            phone: newCompanyData.adminPhone
        };
        
        setCompanies(prev => [...prev, newCompany]);
        setAllUsers(prev => [...prev, newAdminUser]);
        setRoles(prev => ({
            ...prev,
            [companyId]: [newAdminRole]
        }));
        updateCompanyConfig(companyId, defaultConfig); 
        addToast("Empresa y Admin creados con éxito", "success");
        setCreateModalOpen(false);
    };

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Listado de Empresas</h3>
                <Button onClick={() => setCreateModalOpen(true)} variant="primary">
                    <Plus className="w-4 h-4"/> Crear Empresa
                </Button>
            </div>
            <Card className="p-0 overflow-x-auto">
                 <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nombre</th>
                            <th scope="col" className="px-6 py-3">RUT</th>
                            <th scope="col" className="px-6 py-3">Plan</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map(c => (
                            <tr key={c.id} className="bg-white border-b hover:bg-slate-50 cursor-pointer" onClick={() => setEditingCompany(c)}>
                                <td className="px-6 py-4 font-medium text-slate-900">{c.name}</td>
                                <td className="px-6 py-4">{c.rut}</td>
                                <td className="px-6 py-4">{plans.find(p => p.id === c.planId)?.name || 'N/A'}</td>
                                <td className="px-6 py-4 capitalize">{c.status}</td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </Card>

            <CreateCompanyModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setCreateModalOpen(false)} 
                onSubmit={handleCreateCompany}
            />
            {editingCompany && <CompanyEditPanel company={editingCompany} onClose={() => setEditingCompany(null)} />}
        </>
    );
};

export default CompanyManagementPage;
