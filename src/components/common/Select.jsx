// src/components/common/Select.jsx
import React from 'react';

export const Select = ({ label, id, value, onChange, children, description, ...props }) => (
    <div>
        {label && <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
        <select id={id} value={value} onChange={onChange} {...props} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white">
            {children}
        </select>
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
    </div>
);
