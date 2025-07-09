// src/components/common/ConfirmationModal.jsx
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <AlertCircle className="w-16 h-16 mx-auto text-amber-500" />
                    <h3 className="mt-2 text-lg font-semibold text-slate-800">{title}</h3>
                    <div className="mt-2 text-sm text-slate-600">
                        {children}
                    </div>
                </div>
                <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                    <Button onClick={onConfirm} variant="danger" className="w-full sm:ml-3 sm:w-auto">
                        Confirmar
                    </Button>
                    <Button onClick={onClose} variant="secondary" className="mt-3 w-full sm:mt-0 sm:w-auto">
                        Cancelar
                    </Button>
                </div>
            </div>
        </div>
    );
};
