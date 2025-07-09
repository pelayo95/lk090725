// src/components/form-fields/WitnessesField.jsx
import React from 'react';
import { Button, Input, TextArea } from '../common';
import { Plus, Trash } from 'lucide-react';
import { uuidv4 } from '../../utils/uuid';

const WitnessesField = ({ label, description, value, onChange }) => {
    const witnesses = Array.isArray(value) ? value : [];

    const handleWitnessChange = (index, field, fieldValue) => {
        const newWitnesses = [...witnesses];
        newWitnesses[index] = { ...newWitnesses[index], [field]: fieldValue };
        onChange(newWitnesses);
    };

    const addWitness = () => {
        onChange([...witnesses, { id: uuidv4(), name: '', position: '', facts: '' }]);
    };

    const removeWitness = (index) => {
        onChange(witnesses.filter((_, i) => i !== index));
    };

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700">{label}</label>
            {description && <p className="text-xs text-slate-500 mt-1 mb-2">{description}</p>}
            <div className="space-y-4">
                {witnesses.map((witness, index) => (
                    <div key={witness.id} className="p-4 border rounded-md bg-slate-50 relative">
                        <div className="space-y-2">
                            <Input label="Nombre del Testigo" value={witness.name || ''} onChange={(e) => handleWitnessChange(index, 'name', e.target.value)} />
                            <Input label="Cargo del Testigo" value={witness.position || ''} onChange={(e) => handleWitnessChange(index, 'position', e.target.value)} />
                            <TextArea label="¿Sobre qué hechos puede declarar?" value={witness.facts || ''} onChange={(e) => handleWitnessChange(index, 'facts', e.target.value)} rows={2} />
                        </div>
                        <Button variant="ghost" className="absolute top-1 right-1 p-1 h-auto" onClick={() => removeWitness(index)}>
                            <Trash className="w-4 h-4 text-red-500" />
                        </Button>
                    </div>
                ))}
                <Button variant="secondary" onClick={addWitness}>
                    <Plus className="w-4 h-4" /> Agregar otro testigo
                </Button>
            </div>
        </div>
    );
};

export default WitnessesField;
