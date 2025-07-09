// src/components/form-fields/RutInput.jsx
import React from 'react';
import { Input } from '../common';

const RutInput = ({ label, id, value, onChange, description, ...props }) => {
    const formatRut = (rut = '') => {
        rut = rut.replace(/[^0-9kK]/g, '');
        if (rut.length === 0) return '';

        let body = rut.slice(0, -1);
        let dv = rut.slice(-1).toUpperCase();
        body = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        
        return `${body}-${dv}`;
    };

    const cleanRut = (formattedRut = '') => {
        return formattedRut.replace(/[^0-9kK]/g, '');
    }

    const handleChange = (e) => {
        const cleaned = cleanRut(e.target.value);
        const formatted = formatRut(cleaned);
        // Mimic event object structure for consistency
        onChange({ target: { id: id, value: formatted } });
    };

    return (
        <Input 
            label={label}
            id={id}
            value={value || ''}
            onChange={handleChange}
            description={description}
            {...props}
        />
    );
};

export default RutInput;
