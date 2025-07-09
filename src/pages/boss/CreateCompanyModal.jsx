// src/pages/boss/CreateCompanyModal.jsx
import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Modal, Button, Input } from '../../components/common';
import RutInput from '../../components/form-fields/RutInput';
import CompanyForm from './CompanyForm';
import { setNestedValue } from '../../utils/objectUtils';

const CreateCompanyModal = ({ isOpen, onClose, onSubmit }) => {
    const { plans } = useData();
    const [companyData, setCompanyData] = useState({});
    
    useEffect(() => {
        if (isOpen) {
            setCompanyData({ planId: (plans && plans.length > 0) ? plans[0].id : '' });
        }
    }, [isOpen, plans]);

    const handleChange = (path, value) => {
        setCompanyData(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            setNestedValue(newState, path, value);
            return newState;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(companyData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Crear Nueva Empresa">
            <form onSubmit={handleSubmit} className="space-y-6">
                <CompanyForm data={companyData} onDataChange={handleChange} isCreate={true} />
                <div>
                    <h4 className="text-md font-semibold text-indigo-700 mb-3 border-b pb-2">Administrador Inicial</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Nombre Completo" value={companyData.adminName || ''} onChange={e => handleChange('adminName', e.target.value)} required />
                        <RutInput label="RUT" value={companyData.adminRut || ''} onChange={e => handleChange('adminRut', e.target.value)} />
                        <Input label="Cargo" value={companyData.adminPosition || ''} onChange={e => handleChange('adminPosition', e.target.value)} />
                        <Input label="Teléfono" value={companyData.adminPhone || ''} onChange={e => handleChange('adminPhone', e.target.value)} />
                         <Input label="Email (para login)" type="email" value={companyData.adminEmail || ''} onChange={e => handleChange('adminEmail', e.target.value)} required />
                        <Input label="Contraseña" type="password" value={companyData.password || ''} onChange={e => handleChange('password', e.target.value)} required />
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" onClick={onClose} variant="secondary">Cancelar</Button>
                    <Button type="submit" variant="primary">Crear Empresa y Admin</Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateCompanyModal;
