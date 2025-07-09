// src/pages/public/StatusCheckPage.jsx
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Card, Button, Input } from '../../components/common';

const StatusCheckPage = ({ onLoginSuccess, onBack }) => {
    const [caseId, setCaseId] = useState('');
    const [password, setPassword] = useState('');
    const { complaints } = useData();
    const { addToast } = useNotification();

    const handleSubmit = (e) => {
        e.preventDefault();
        const foundComplaint = complaints.find(
            c => c.id.toLowerCase() === caseId.toLowerCase().trim() && c.password === password.trim()
        );

        if (foundComplaint) {
            onLoginSuccess(foundComplaint);
        } else {
            addToast('Código de caso o contraseña incorrectos.', 'error');
        }
    };

    return (
        <Card>
            <h2 className="text-xl font-semibold text-slate-700 mb-1">Seguimiento de Caso</h2>
            <p className="text-slate-500 mb-6">Ingrese su código y contraseña para ver el estado de su denuncia.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Código del Caso" id="caseId" value={caseId} onChange={e => setCaseId(e.target.value)} required />
                <Input label="Contraseña" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                <div className="flex justify-between items-center pt-2">
                    <Button type="button" variant="secondary" onClick={onBack}>Volver</Button>
                    <Button type="submit" variant="primary">Consultar</Button>
                </div>
            </form>
        </Card>
    );
};

export default StatusCheckPage;
