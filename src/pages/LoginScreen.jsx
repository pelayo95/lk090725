import React, { useState } from 'react';
import { LogIn, Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useNotification } from '../contexts/NotificationContext';
import { Card, Button, Input } from '../components/common';

const LoginScreen = () => {
    const { login } = useAuth();
    const { companies } = useData();
    const { addToast } = useNotification();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        const loggedInUser = login(email, password);
        if (loggedInUser) {
            if (loggedInUser.role === 'admin' || loggedInUser.role === 'investigador') {
                const company = companies.find(c => c.id === loggedInUser.companyId);
                if (company?.status === 'inactivo') {
                    addToast('La empresa se encuentra inactiva. Contacte al administrador.', 'error');
                    return;
                }
            }
            if (loggedInUser.role === 'boss') {
                window.location.hash = '#boss/dashboard';
            } else {
                window.location.hash = '#admin';
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-6">
                    <Briefcase className="inline-block w-12 h-12 text-indigo-600"/>
                    <h1 className="text-2xl font-bold text-slate-800">Acceso a Plataforma</h1>
                </div>
                <Card>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input label="Correo Electrónico" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usted@ejemplo.com" required />
                        <Input label="Contraseña" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <Button type="submit" className="w-full justify-center">
                           <LogIn className="w-5 h-5"/> Ingresar
                        </Button>
                    </form>
                    <div className="mt-4 text-center">
                        <a href="#public" className="text-sm text-indigo-600 hover:underline">Volver al portal público</a>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default LoginScreen;
