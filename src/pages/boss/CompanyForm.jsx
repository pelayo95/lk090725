// src/pages/boss/CompanyForm.jsx
import React from 'react';
import { Input, Select } from '../../components/common';
import RutInput from '../../components/form-fields/RutInput';
import { useData } from '../../contexts/DataContext';

const CompanyForm = ({ data, onDataChange, isCreate = false }) => {
    const { plans } = useData();
    return (
        <>
            <div>
                <h4 className="text-md font-semibold text-indigo-700 mb-3 border-b pb-2">Datos de la Empresa</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Razón Social" value={data.legalName || ''} onChange={e => onDataChange('legalName', e.target.value)} required />
                    <Input label="Nombre de Fantasía" value={data.name || ''} onChange={e => onDataChange('name', e.target.value)} required />
                    <RutInput label="RUT Empresa" value={data.rut || ''} onChange={e => onDataChange('rut', e.target.value)} required />
                    <Input label="Abreviación" value={data.abbreviation || ''} onChange={e => onDataChange('abbreviation', e.target.value)} />
                    <Input label="Dirección" value={data.address || ''} onChange={e => onDataChange('address', e.target.value)} className="md:col-span-2" />
                    <Select label="Plan Comercial" value={data.planId || ''} onChange={e => onDataChange('planId', e.target.value)}>
                        {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </Select>
                    {!isCreate && (
                        <Select label="Estado" value={data.status} onChange={e => onDataChange('status', e.target.value)}>
                            <option value="activo">Activo</option> <option value="oculto">Oculto</option> <option value="inactivo">Inactivo</option>
                        </Select>
                    )}
                </div>
            </div>
            <div>
                <h4 className="text-md font-semibold text-indigo-700 mb-3 border-b pb-2">Contacto Comercial</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Nombre Completo" value={data.commercialContact?.name || ''} onChange={e => onDataChange('commercialContact.name', e.target.value)} />
                    <RutInput label="RUT" value={data.commercialContact?.rut || ''} onChange={e => onDataChange('commercialContact.rut', e.target.value)} />
                    <Input label="Cargo" value={data.commercialContact?.position || ''} onChange={e => onDataChange('commercialContact.position', e.target.value)} />
                    <Input label="Teléfono" value={data.commercialContact?.phone || ''} onChange={e => onDataChange('commercialContact.phone', e.target.value)} />
                    <Input label="Email de Contacto" type="email" value={data.commercialContact?.email || ''} onChange={e => onDataChange('commercialContact.email', e.target.value)} />
                </div>
            </div>
        </>
    )
};

export default CompanyForm;
