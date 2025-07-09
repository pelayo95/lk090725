// src/components/form-fields/AccusedPersonsField.jsx
import React from 'react';
import { Button, Input } from '../common';
import { RadioGroup } from './RadioGroup';
import { Plus, Trash } from 'lucide-react';
import { uuidv4 } from '../../utils/uuid';

const AccusedPersonsField = ({ label, description, value, onChange, required }) => {
    const accusedPersons = Array.isArray(value) ? value : [];

    const handleAccusedChange = (index, field, fieldValue) => {
        const newAccused = [...accusedPersons];
        newAccused[index] = { ...newAccused[index], [field]: fieldValue };
        if(field === 'employeeType' && fieldValue === 'Trabajador de mi misma empresa') {
            newAccused[index].employerName = '';
        }
        onChange(newAccused);
    };

    const addAccused = () => {
        onChange([...accusedPersons, { id: uuidv4(), name: '', position: '', dependency: '', employeeType: 'Trabajador de mi misma empresa', employerName: '' }]);
    };

    const removeAccused = (index) => {
        onChange(accusedPersons.filter((_, i) => i !== index));
    };

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700">{label}</label>
            {description && <p className="text-xs text-slate-500 mt-1 mb-2">{description}</p>}
            <div className="space-y-4">
                {accusedPersons.map((person, index) => (
                    <div key={person.id} className="p-4 border rounded-md bg-slate-50 relative">
                        <div className="space-y-4">
                            <Input label="Nombre Completo del Denunciado/a" value={person.name || ''} onChange={(e) => handleAccusedChange(index, 'name', e.target.value)} required={required && index === 0}/>
                            <Input label="Cargo / Puesto de Trabajo" value={person.position || ''} onChange={(e) => handleAccusedChange(index, 'position', e.target.value)} />
                            <RadioGroup
                                label="Tipo de trabajador"
                                id={`employeeType-${person.id}`}
                                value={person.employeeType}
                                onChange={(e) => handleAccusedChange(index, 'employeeType', e.target.value)}
                                options={["Trabajador de mi misma empresa", "Trabajador de otra empresa"]}
                            />
                            {person.employeeType === 'Trabajador de otra empresa' && (
                                 <Input label="Nombre del Empleador" value={person.employerName || ''} onChange={(e) => handleAccusedChange(index, 'employerName', e.target.value)} />
                            )}
                        </div>
                        {index > 0 && <Button variant="ghost" className="absolute top-1 right-1 p-1 h-auto" onClick={() => removeAccused(index)}>
                            <Trash className="w-4 h-4 text-red-500" />
                        </Button>}
                    </div>
                ))}
                <Button variant="secondary" onClick={addAccused}>
                    <Plus className="w-4 h-4" /> Agregar otro denunciado
                </Button>
            </div>
        </div>
    )
};

export default AccusedPersonsField;
