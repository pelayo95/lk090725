// src/pages/admin/settings/DeclarationSettings.jsx
import React from 'react';
import { Card, TextArea } from '../../../components/common';

const DeclarationSettings = ({ config, setConfig }) => {
    const handleChange = (e) => {
        setConfig(prev => ({ ...prev, complaintDeclarationText: e.target.value }));
    };

    return (
        <Card>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Declaración de Veracidad del Formulario</h3>
            <p className="text-sm text-slate-500 mb-4">Este texto se mostrará al final del formulario de denuncia y el usuario deberá aceptarlo para poder enviar el caso.</p>
            <TextArea
                label="Texto de la Declaración"
                value={config.complaintDeclarationText || ''}
                onChange={handleChange}
                rows={8}
            />
        </Card>
    );
};

export default DeclarationSettings;
