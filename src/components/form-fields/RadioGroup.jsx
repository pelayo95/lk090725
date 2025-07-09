// src/components/form-fields/RadioGroup.jsx
import React from 'react';

export const RadioGroup = ({ label, id, value, onChange, options, description, required }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
        {description && <p className="text-xs text-slate-500 -mt-1 mb-2">{description}</p>}
        <div className="space-y-2">
            {options.map(option => (
                <label key={option} className="flex items-center gap-2 p-3 border rounded-md has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-500 cursor-pointer">
                    <input
                        type="radio"
                        name={id}
                        value={option}
                        checked={value === option}
                        onChange={onChange}
                        required={required}
                        className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-800">{option}</span>
                </label>
            ))}
        </div>
    </div>
);
