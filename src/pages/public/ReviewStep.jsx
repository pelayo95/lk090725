// src/pages/public/ReviewStep.jsx
import React from 'react';
import { Button } from '../../components/common';
import { Edit, AlertTriangle } from 'lucide-react';
import { getNestedValue } from '../../utils/objectUtils';

const ReviewStep = ({ formData, formSteps, onEdit, declarationText, declarationAccepted, onDeclarationChange }) => (
    <div className="space-y-6">
        {formSteps.map((step, stepIndex) => {
            const hasData = step.fields.some(field => {
                const value = getNestedValue(formData, field.dataKey);
                return value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0);
            });

            if (!hasData) return null;

            return (
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
                            if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
                                return null;
                            }
                            
                            let displayValue;
                            if (Array.isArray(value)) {
                                if (field.type === 'accusedPersons') {
                                    return (
                                        <div key={field.id} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
                                            <dt className="text-slate-500 font-medium">{field.label}:</dt>
                                            <dd className="col-span-2 space-y-2">
                                                {value.map((person, i) => (
                                                    <div key={person.id} className="p-2 border rounded-md bg-slate-50 text-xs">
                                                        <p><span className="font-semibold">Nombre:</span> {person.name || 'N/A'}</p>
                                                        <p><span className="font-semibold">Cargo:</span> {person.position || 'N/A'}</p>
                                                        <p><span className="font-semibold">Relación:</span> {person.relacion || 'N/A'}</p>
                                                        <p><span className="font-semibold">Tipo:</span> {person.employeeType || 'N/A'}</p>
                                                        {person.employerName && <p><span className="font-semibold">Empleador:</span> {person.employerName}</p>}
                                                    </div>
                                                ))}
                                            </dd>
                                        </div>
                                    );
                                }
                                if (field.type === 'witnesses') displayValue = value.map(w => w.name).join(', ');
                                else if (field.type === 'documents') displayValue = value.map(d => d.fileName || 'Archivo').join(', ');
                                else displayValue = value.join(', ');
                            } else {
                                displayValue = value;
                            }
                            
                            return (
                                <div key={field.id} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <dt className="text-slate-500 font-medium">{field.label}:</dt>
                                    <dd className="col-span-2 text-slate-700">{displayValue}</dd>
                                </div>
                            );
                        })}
                    </dl>
                </div>
            );
        })}
        <div className="mt-6 p-4 border-t-4 border-amber-400 bg-amber-50 rounded-lg">
            <h4 className="font-bold text-amber-800 flex items-center gap-2"><AlertTriangle/> Declaración de Veracidad</h4>
            <p className="text-sm text-amber-900 mt-2">{declarationText}</p>
            <label className="flex items-center gap-3 mt-4 cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={declarationAccepted}
                    onChange={(e) => onDeclarationChange(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-700">Acepto la declaración</span>
            </label>
        </div>
    </div>
);

export default ReviewStep;
