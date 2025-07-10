// src/components/form-fields/RadioGroup.jsx
import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

export const RadioGroup = ({ label, id, value, onChange, options, description, required }) => {
    const [selectedDefinition, setSelectedDefinition] = useState('');

    // Actualiza la definición cuando el valor seleccionado cambia desde fuera
    useEffect(() => {
        const selectedOption = options.find(option => option.value === value);
        if (selectedOption) {
            setSelectedDefinition(selectedOption.definition);
        } else {
            setSelectedDefinition('');
        }
    }, [value, options]);

    const handleChange = (e) => {
        const selectedValue = e.target.value;
        const selectedOption = options.find(option => option.value === selectedValue);
        if (selectedOption) {
            setSelectedDefinition(selectedOption.definition);
        }
        onChange(e); // Propaga el evento original hacia arriba
    };

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
            {description && <p className="text-xs text-slate-500 -mt-1 mb-2">{description}</p>}
            <div className="space-y-2">
                {options.map(option => (
                    <label key={option.value} className="flex items-center gap-2 p-3 border rounded-md has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-500 cursor-pointer transition-colors">
                        <input
                            type="radio"
                            name={id}
                            value={option.value}
                            checked={value === option.value}
                            onChange={handleChange}
                            required={required}
                            className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-800">{option.value}</span>
                    </label>
                ))}
            </div>
            {selectedDefinition && (
                <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Info className="h-5 w-5 text-blue-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm">{selectedDefinition}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
