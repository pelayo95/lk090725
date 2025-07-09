// src/components/common/Input.jsx
import React from 'react';

export const Input = React.forwardRef(({ label, id, value, onChange, description, ...props }, ref) => (
    <div>
        {label && <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
        <input ref={ref} id={id} value={value} onChange={onChange} {...props} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
    </div>
));
