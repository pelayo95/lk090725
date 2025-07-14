import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const Accordion = ({ title, titleIcon, headerClassName = '', children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex justify-between items-center p-4 text-left font-semibold text-slate-800 transition-colors duration-200 ${isOpen ? headerClassName : 'bg-slate-50 hover:bg-slate-100'}`}
            >
                <div className="flex items-center gap-3">
                    {titleIcon}
                    <span className={isOpen ? 'text-white' : 'text-slate-800'}>{title}</span>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : 'text-slate-500'}`} />
            </button>
            {isOpen && (
                <div className="p-0 bg-white">
                    {children}
                </div>
            )}
        </div>
    );
};

export default Accordion;
