// src/pages/admin/case-details/MeasuresTab.jsx
import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { useConfig } from '../../../contexts/ConfigContext';
import { Card, Button, Select, Modal, TextArea } from '../../../components/common';
import { Plus, Edit, User, Calendar, FileText, Copy } from 'lucide-react';
import { uuidv4 } from '../../../utils/uuid';
import { getUserNameById } from '../../../utils/userUtils';
import AddMeasureModal from './AddMeasureModal';
import { useNotification } from '../../../contexts/NotificationContext';

// Nuevo componente para el modal de solicitud de documentos
const DocumentationRequestModal = ({ isOpen, onClose, measure, complaint }) => {
    const { addToast } = useNotification();
    if (!isOpen) return null;

    const complainantName = complaint.originalData.complainant?.name || 'el/la denunciante';
    const accusedNames = (complaint.originalData.accusedPersons || []).map(p => p.name).join(', ') || 'el/la denunciado/a';

    const emailBody = `
Estimados,

Junto con saludar, y en el marco de la investigación del caso [${complaint.id}], se ha determinado la siguiente medida de resguardo:

- Tipo de Medida: ${measure.text}
- Fecha de Inicio: ${measure.startDate || 'No especificada'}
- Fecha de Término: ${measure.endDate || 'No especificada'}
- Descripción Adicional: ${measure.description || 'Sin descripción adicional.'}

Para dar cumplimiento a lo anterior, se solicita la emisión de la documentación laboral correspondiente (anexos de contrato, etc.) para formalizar esta medida para las siguientes partes:

- Denunciante: ${complainantName}
- Denunciado(s): ${accusedNames}

Agradecemos su pronta gestión.

Saludos cordiales,
Equipo de Investigación.
    `.trim();

    const copyToClipboard = () => {
        navigator.clipboard.writeText(emailBody).then(() => {
            addToast('Borrador de correo copiado al portapapeles.', 'success');
        }, () => {
            addToast('Error al copiar el texto.', 'error');
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Generar Solicitud de Documentación">
            <div className="space-y-4">
                <p className="text-sm text-slate-600">A continuación se presenta un borrador del correo de solicitud. Puede copiarlo y ajustarlo según sea necesario.</p>
                <TextArea
                    value={emailBody}
                    readOnly
                    rows={15}
                    className="bg-slate-50 font-mono text-xs"
                />
                <div className="flex justify-end gap-2">
                    <Button onClick={onClose} variant="secondary">Cerrar</Button>
                    <Button onClick={copyToClipboard} variant="primary">
                        <Copy className="w-4 h-4"/> Copiar Texto
                    </Button>
                </div>
            </div>
        </Modal>
    );
};


const MeasuresTab = ({ complaint }) => {
    const { user, allUsers } = useAuth();
    const { updateComplaint } = useData();
    const { getCompanyConfig } = useConfig();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToModify, setItemToModify] = useState(null);
    const [isDocRequestModalOpen, setIsDocRequestModalOpen] = useState(false);
    const [measureForDocRequest, setMeasureForDocRequest] = useState(null);
    
    // ... (lógica de handleSave, handleEditClick, etc. sin cambios)

    return (
        <Card>
            {/* ... (código del header sin cambios) */}
            <div className="space-y-3">
                {complaint.safeguardMeasures.map(m => (
                    <div key={m.id} className="p-3 border rounded-lg bg-white">
                         <div className="flex justify-between items-start">
                            <p className="text-slate-800 flex-1">{m.text}</p>
                            <div className="flex items-center">
                                {user.permissions.medidas_puede_crear && ( // Asumimos que este permiso también permite solicitar documentos
                                    <Button variant="ghost" className="p-1 h-auto" title="Solicitar Documentación" onClick={() => { setMeasureForDocRequest(m); setIsDocRequestModalOpen(true); }}>
                                        <FileText className="w-4 h-4 text-blue-600"/>
                                    </Button>
                                )}
                                {user.permissions.medidas_puede_editar && (
                                    <Button variant="ghost" className="p-1 h-auto" onClick={() => handleEditClick(m)}><Edit className="w-4 h-4 text-slate-500"/></Button>
                                )}
                            </div>
                        </div>
                        {/* ... (resto del JSX de la medida sin cambios) */}
                    </div>
                ))}
            </div>
            {/* ... (código del AddMeasureModal sin cambios) */}
            <DocumentationRequestModal
                isOpen={isDocRequestModalOpen}
                onClose={() => setIsDocRequestModalOpen(false)}
                measure={measureForDocRequest}
                complaint={complaint}
            />
        </Card>
    );
};

export default MeasuresTab;
