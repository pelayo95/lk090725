// src/pages/boss/PlanModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select, Card, Tooltip } from '../../components/common';
import { allPermissions } from '../../data/permissions';
import { allFeatures, defaultFeaturesState } from '../../config/features';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

const PermissionGroup = ({ title, keys, permissions, onPermissionChange, onToggleAll, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    
    const booleanPermissions = keys.filter(k => !k.includes('_alcance'));
    const scopePermissions = keys.filter(k => k.includes('_alcance'));
    
    const allSelected = booleanPermissions.length > 0 && booleanPermissions.every(k => permissions[k]);

    return (
        <Card className="p-0 overflow-hidden border border-slate-200">
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
                <h4 className="font-semibold text-slate-800 text-left">{title}</h4>
                {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500"/> : <ChevronDown className="w-5 h-5 text-slate-500"/>}
            </button>
            {isOpen && (
                <div className="p-4 bg-white">
                    {booleanPermissions.length > 0 && (
                        <div className="border-b pb-4 mb-4">
                            <div className="flex justify-end mb-3">
                                <Button type="button" variant="secondary" size="sm" onClick={() => onToggleAll(keys, !allSelected)}>
                                    {allSelected ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                                {booleanPermissions.map(key => (
                                    <label key={key} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-md cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!!permissions[key]}
                                            onChange={e => onPermissionChange(key, e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-slate-700">{allPermissions[key]}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {scopePermissions.length > 0 && (
                         <div className="space-y-4">
                            {scopePermissions.map(key => {
                                const options = key.includes('agenda') ? ['propia', 'empresa'] : ['todos', 'asignados', 'propios'];
                                return (
                                    <div key={key}>
                                        <Select
                                            label={allPermissions[key]}
                                            value={permissions[key] || options[0]}
                                            onChange={e => onPermissionChange(key, e.target.value)}
                                        >
                                            {options.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                                        </Select>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </Card>
    )
}


const PlanModal = ({ isOpen, onClose, onSave, plan }) => {
    const [name, setName] = useState('');
    const [features, setFeatures] = useState(defaultFeaturesState);

    useEffect(() => {
        if(plan) {
            setName(plan.name);
            setFeatures({...defaultFeaturesState, ...plan.features});
        } else {
            setName('');
            setFeatures(defaultFeaturesState);
        }
    }, [plan]);

    const handleFeatureChange = (featureKey, value) => {
        setFeatures(prev => ({...prev, [featureKey]: value}));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ name, features });
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={plan ? 'Editar Plan' : 'Crear Nuevo Plan'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Nombre del Plan" value={name} onChange={e => setName(e.target.value)} required />
                <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
                    {allFeatures.map(section => (
                        <Card key={`${section.section}-${section.module}`} className="p-4">
                             <h4 className="font-semibold text-slate-800 border-b pb-1 mb-2">{section.section} - {section.module}</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                {section.features.map(feature => (
                                    <label key={feature.key} className="flex items-center gap-2 text-sm p-2 hover:bg-slate-50 rounded-md">
                                        <input type="checkbox" checked={features[feature.key] || false} onChange={(e) => handleFeatureChange(feature.key, e.target.checked)} />
                                        <span>{feature.label}</span>
                                        <Tooltip text={feature.description}>
                                            <Info className="w-3.5 h-3.5 text-slate-400"/>
                                        </Tooltip>
                                    </label>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                    <Button type="button" onClick={onClose} variant="secondary">Cancelar</Button>
                    <Button type="submit" variant="primary">Guardar</Button>
                </div>
            </form>
        </Modal>
    );
};

export default PlanModal;
