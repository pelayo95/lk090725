// src/pages/boss/PlanModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Tooltip } from '../../components/common';
import { allFeatures, defaultFeaturesState } from '../../config/features';
import { Info } from 'lucide-react';

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

    const handleFeatureChange = (featureKey) => {
        setFeatures(prev => ({...prev, [featureKey]: !prev[featureKey]}));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ name, features });
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={plan ? 'Editar Plan' : 'Crear Nuevo Plan'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Nombre del Plan" value={name} onChange={e => setName(e.target.value)} required />
                <div className="space-y-4">
                    {allFeatures.map(section => (
                        <div key={`${section.section}-${section.module}`}>
                            <h4 className="font-semibold text-slate-800 border-b pb-1 mb-2">{section.section} - {section.module}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                {section.features.map(feature => (
                                    <label key={feature.key} className="flex items-center gap-2 text-sm p-2 hover:bg-slate-50 rounded-md">
                                        <input type="checkbox" checked={features[feature.key] || false} onChange={() => handleFeatureChange(feature.key)} />
                                        <span>{feature.label}</span>
                                        <Tooltip text={feature.description}>
                                            <Info className="w-3.5 h-3.5 text-slate-400"/>
                                        </Tooltip>
                                    </label>
                                ))}
                            </div>
                        </div>
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
