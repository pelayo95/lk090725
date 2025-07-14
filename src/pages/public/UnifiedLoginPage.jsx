// src/pages/public/UnifiedLoginPage.jsx
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Card, Button, Input } from '../../components/common';

const UnifiedLoginPage = ({ onLoginSuccess, onBack }) => {
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const { complaints } = useData();
    const { addToast } = useNotification();

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmedCode = code.trim();
        const trimmedPassword = password.trim();

        // 1. Intentar como Denunciante (Código de Caso)
        const complainantLogin = complaints.find(
            c => c.id.toLowerCase() === trimmedCode.toLowerCase() && c.password === trimmedPassword
        );

        if (complainantLogin) {
            onLoginSuccess({ type: 'complainant', data: complainantLogin });
            return;
        }

        // 2. Si falla, intentar como Denunciado (Código de Acceso)
        let accusedLogin = null;
        for (const complaint of complaints) {
            const accusedPerson = (complaint.originalData.accusedPersons || []).find(
                p => p.accessCode === trimmedCode && p.password === trimmedPassword
            );
            if (accusedPerson) {
                accusedLogin = { complaint, accusedPerson };
                break;
            }
        }

        if (accusedLogin) {
            onLoginSuccess({ type: 'accused', data: accusedLogin });
            return;
        }

        // 3. Si ambos fallan, mostrar error
        addToast('Código o contraseña incorrectos.', 'error');
    };

    return (
        <Card>
            <h2 className="text-xl font-semibold text-slate-700 mb-1">Seguimiento de Caso</h2>
            <p className="text-slate-500 mb-6">Ingrese su código y contraseña para ver el estado de su caso.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Código de Caso o Acceso" id="code" value={code} onChange={e => setCode(e.target.value)} required />
                <Input label="Contraseña" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                <div className="flex justify-between items-center pt-2">
                    <Button type="button" variant="secondary" onClick={onBack}>Volver</Button>
                    <Button type="submit" variant="primary">Consultar</Button>
                </div>
            </form>
        </Card>
    );
};

export default UnifiedLoginPage;
