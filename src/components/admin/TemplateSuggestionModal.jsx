// src/components/admin/TemplateSuggestionModal.jsx
import React from 'react';
import { useTemplateSuggestion } from '../../contexts/TemplateSuggestionContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Modal, Button, TextArea } from '../common';
import { MessageSquarePlus, Copy, X } from 'lucide-react';

const TemplateSuggestionModal = () => {
    const { suggestion, clearSuggestion } = useTemplateSuggestion();
    const { addToast } = useNotification();

    if (!suggestion) return null;

    const { caseId, template } = suggestion;
    const processedContent = template.content.replace(/\[CODIGO_CASO\]/g, caseId || '');

    const handleCopyAndGo = () => {
        navigator.clipboard.writeText(processedContent);
        addToast('Mensaje copiado al portapapeles.', 'success');
        window.location.hash = `#admin/cases/${caseId}`;
        clearSuggestion();
    };

    return (
        <Modal isOpen={!!suggestion} onClose={clearSuggestion} title="Sugerencia de Comunicación">
            <div className="text-center">
                <MessageSquarePlus className="w-16 h-16 mx-auto text-indigo-500" />
                <h3 className="mt-2 text-lg font-semibold text-slate-800">
                    Sugerencia para el caso {caseId}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                    Hemos detectado un evento relevante y te sugerimos usar la siguiente plantilla de comunicación: 
                    <strong className="text-indigo-600"> "{template.name}"</strong>.
                </p>
                <div className="mt-4 text-left">
                    <TextArea value={processedContent} readOnly rows={8} className="bg-slate-50"/>
                </div>
            </div>
            <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg mt-6">
                <Button onClick={handleCopyAndGo} variant="primary" className="w-full sm:ml-3 sm:w-auto">
                    <Copy className="w-4 h-4" /> Copiar e Ir al Caso
                </Button>
                 <Button onClick={clearSuggestion} variant="ghost" className="mr-auto text-red-600">
                    <X className="w-4 h-4" /> Descartar
                </Button>
            </div>
        </Modal>
    );
};

export default TemplateSuggestionModal;
