// src/pages/public/ReviewStep.jsx
import React from 'react';
import { Button } from '../../components/common';
import { Edit } from 'lucide-react';
import { getNestedValue } from '../../utils/objectUtils';

const ReviewStep = ({ formData, formSteps, onEdit }) => (
    <div className="space-y-6">
        {formSteps.map((step, stepIndex) => (
            <div key={step.id} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-slate-800">{step.title}</h3>
                    <Button onClick={() => onEdit(stepIndex)} variant="ghost" className="text-sm">
                        <Edit className="w-4 h-4"/> Editar
                    </Button>
                </div>
                <dl className="space-y-2 text-sm">
                    {step.fields.map(field => {
                        const value = getNestedValue(formData, field.dataKey);
                        let displayValue;
                        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
                             displayValue = 'No ingresado';
                        } else if (Array.isArray(value)) {
                            if (field.type === 'accusedPersons') {
                                return value.map((person, i) => (
                                    <div key={person.id} className="mt-2 pt-2 border-t first:border-t-0">
                                        <p className="font-semibold">Denunciado/a #{i + 1}: <span className="font-medium">{person.name || 'N/A'}</span></p>
                                        <div className="pl-4">
                                            <p>Cargo: {person.position || 'N/A'}</p>
                                            <p>Tipo: {person.employeeType || 'N/A'}</p>
                                            {person.employerName && <p>Empleador: {person.employerName}</p>}
                                        </div>
                                    </div>
                                ))
                            }
                            if (field.type === 'witnesses') displayValue = value.map(w => w.name).join(', ');
                            else if (field.type === 'documents') displayValue = value.map(d => d.fileName || 'Archivo').join(', ');
                            else displayValue = value.join(', ');
                        } else {
                            displayValue = value;
                        }
                        
                        return (
                            <div key={field.id} className="grid grid-cols-3 gap-2">
                                <dt className="text-slate-500">{field.label}:</dt>
                                <dd className="col-span-2 text-slate-700 font-medium">{displayValue}</dd>
                            </div>
                        );
                    })}
                </dl>
            </div>
        ))}
    </div>
);

export default ReviewStep;
