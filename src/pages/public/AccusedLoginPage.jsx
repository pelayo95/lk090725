// src/pages/public/AccusedLoginPage.jsx
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Card, Button, Input } from '../../components/common';

const AccusedLoginPage = ({ onLoginSuccess, onBack }) => {
    const [accessCode, setAccessCode] = useState('');
    const [password, setPassword] = useState('');
    const { complaints } = useData();
    const { addToast } = useNotification();

    const handleSubmit = (e) => {
        e.preventDefault();
        let found = null;

        for (const complaint of complaints) {
            const accusedPerson = (complaint.originalData.accusedPersons || []).find(
                p => p.accessCode === accessCode.trim() && p.password === password.trim()
            );
            if (accusedPerson) {
                found = { complaint, accusedPerson };
                break;
            }
        }

        if (found) {
            onLoginSuccess(found.complaint, found.accusedPerson);
        } else {
            addToast('Código de acceso o contraseña incorrectos.', 'error');
        }
    };

    return (
        <Card>
            <h2 className="text-xl font-semibold text-slate-700 mb-1">Portal del Denunciado</h2>
            <p className="text-slate-500 mb-6">Ingrese sus credenciales para ver el estado y antecedentes del caso en el que ha sido mencionado/a.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Código de Acceso" id="accessCode" value={accessCode} onChange={e => setAccessCode(e.target.value)} required />
                <Input label="Contraseña" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                <div className="flex justify-between items-center pt-2">
                    <Button type="button" variant="secondary" onClick={onBack}>Volver</Button>
                    <Button type="submit" variant="primary">Consultar</Button>
                </div>
            </form>
        </Card>
    );
};

export default AccusedLoginPage;
