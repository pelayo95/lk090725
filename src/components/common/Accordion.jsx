// src/components/common/Accordion.jsx
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const Accordion = ({ title, titleIcon, headerClassName, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    // Se define una clase por defecto para el encabezado cuando está abierto.
    // Si se pasa `headerClassName`, este lo sobreescribirá.
    const defaultOpenHeaderClass = 'bg-slate-700 text-white';

    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex justify-between items-center p-4 text-left font-semibold transition-colors duration-200 ${isOpen ? (headerClassName || defaultOpenHeaderClass) : 'bg-slate-50 text-slate-800 hover:bg-slate-100'}`}
            >
                <div className="flex items-center gap-3">
                    {/* El ícono y el título heredarán el color del texto del botón */}
                    {titleIcon}
                    <span>{title}</span>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="bg-white border-t border-slate-200">
                    {/* El contenido del chat ya tiene su propio padding, así que lo removemos de aquí para evitar doble padding */}
                    {children}
                </div>
            )}
        </div>
    );
};

export default Accordion;
