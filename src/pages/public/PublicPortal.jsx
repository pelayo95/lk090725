// src/pages/public/PublicPortal.jsx
import React, { useState, useEffect } from 'react';
import { Shield, ChevronRight, CheckCircle, Copy } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Card, Button, ConfirmationModal } from '../../components/common';
import ComplaintForm from './ComplaintForm'; 
import ComplaintStatusPortal from './ComplaintStatusPortal';
import AccusedPortal from './AccusedPortal';
import UnifiedLoginPage from './UnifiedLoginPage'; // Importar la nueva página de login

const PublicPortal = () => {
    const { companies, complaints } = useData();
    const [view, setView] = useState('selectCompany');
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [caseInfo, setCaseInfo] = useState(null);
    const [loggedInCase, setLoggedInCase] = useState(null);
    const [loggedInAccused, setLoggedInAccused] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const { addToast } = useNotification();
    
    const activeCompanies = companies.filter(c => c.status === 'activo');

    useEffect(() => {
        if (loggedInCase) {
            const updatedCase = complaints.find(c => c.id === loggedInCase.id);
            if (updatedCase) setLoggedInCase(updatedCase);
        }
    }, [complaints, loggedInCase?.id]);

    const handleCompanySelect = (company) => {
        setSelectedCompany(company);
        setIsConfirmModalOpen(true);
    };
    
    const handleConfirmCompany = () => {
        setIsConfirmModalOpen(false);
        setView('form');
    };
    
    const handleCancelCompany = () => {
        setIsConfirmModalOpen(false);
        setSelectedCompany(null);
    };

    const handleFormSuccess = (newComplaint) => {
        setCaseInfo({ id: newComplaint.id, password: newComplaint.password });
        setView('success');
    };
    
    const handleUnifiedLoginSuccess = ({ type, data }) => {
        if (type === 'complainant') {
            setLoggedInCase(data);
            setView('complainantPortal');
        } else if (type === 'accused') {
            setLoggedInCase(data.complaint);
            setLoggedInAccused(data.accusedPerson);
            setView('accusedPortal');
        }
    };

    const handleLogout = () => {
        setView('selectCompany');
        setLoggedInCase(null);
        setLoggedInAccused(null);
    };

    const copyToClipboard = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try { document.execCommand('copy'); addToast(`'${text}' copiado al portapapeles`, 'success'); }
        catch (err) { addToast('Error al copiar', 'error'); }
        document.body.removeChild(textArea);
    };

    const renderContent = () => {
        switch (view) {
            case 'form': return <ComplaintForm companyId={selectedCompany.id} onBack={() => setView('selectCompany')} onSuccess={handleFormSuccess} />;
            case 'success': return (
                <Card className="text-center">
                    <CheckCircle className="inline-block w-16 h-16 text-emerald-500"/>
                    <h2 className="text-2xl font-bold text-slate-800 mt-4">Denuncia Enviada Exitosamente</h2>
                    <p className="text-slate-600 mt-2 mb-6">Guarde sus credenciales en un lugar seguro. Las necesitará para hacer seguimiento de su caso.</p>
                    <div className="mt-4 space-y-4 text-left bg-slate-100 p-6 rounded-lg inline-block w-full max-w-md">
                        <div>
                            <label className="text-sm font-medium text-slate-600">Código del Caso</label>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-2xl font-mono text-indigo-700 bg-white p-2 rounded-md flex-grow">{caseInfo?.id}</p>
                                <Button variant="secondary" onClick={() => copyToClipboard(caseInfo?.id)}><Copy className="w-4 h-4" /></Button>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-600">Contraseña de Seguimiento</label>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-2xl font-mono text-indigo-700 bg-white p-2 rounded-md flex-grow">{caseInfo?.password}</p>
                                <Button variant="secondary" onClick={() => copyToClipboard(caseInfo?.password)}><Copy className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    </div>
                    <Button onClick={() => setView('selectCompany')} className="mt-8">Volver al Inicio</Button>
                </Card>
            );
            case 'unifiedLogin': return <UnifiedLoginPage onLoginSuccess={handleUnifiedLoginSuccess} onBack={handleLogout} />;
            case 'complainantPortal': return <ComplaintStatusPortal complaint={loggedInCase} onBack={handleLogout} />;
            case 'accusedPortal': return <AccusedPortal complaint={loggedInCase} accusedPerson={loggedInAccused} onBack={handleLogout} />;
            case 'selectCompany':
            default:
                return (
                    <Card>
                        <h2 className="text-xl font-semibold text-slate-700">Seleccione su Empresa</h2>
                        <p className="text-slate-500 mb-6">Para iniciar el proceso, por favor seleccione la empresa a la que pertenece.</p>
                        <div className="space-y-3">
                            {activeCompanies.map(company => (
                                <button key={company.id} onClick={() => handleCompanySelect(company)} className="w-full text-left p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-indigo-500 transition-all flex justify-between items-center">
                                    <span className="font-semibold text-slate-700">{company.name}</span>
                                    <ChevronRight className="w-5 h-5 text-indigo-500"/>
                                </button>
                            ))}
                        </div>
                         <div className="mt-6 text-center flex justify-around gap-4 flex-wrap">
                            <a href="#admin" className="text-sm text-indigo-600 hover:underline">Acceso Administradores</a>
                            <button onClick={() => setView('unifiedLogin')} className="text-sm text-indigo-600 hover:underline">Seguimiento de Caso</button>
                        </div>
                    </Card>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <Shield className="inline-block w-16 h-16 text-indigo-600"/>
                    <h1 className="text-3xl font-bold text-slate-800">Canal de Denuncias</h1>
                    <p className="text-slate-600 mt-2">Un espacio seguro y confidencial para informar situaciones.</p>
                </div>
                {renderContent()}
                {isConfirmModalOpen && (
                    <ConfirmationModal isOpen={isConfirmModalOpen} onClose={handleCancelCompany} onConfirm={handleConfirmCompany} title={`Confirmar Empresa: ${selectedCompany?.name}`}>
                        <p>Está a punto de ingresar una denuncia para la empresa **{selectedCompany?.name}**. Por favor, asegúrese de que esta es la empresa correcta.</p>
                        <p className="mt-2">Recuerde que este es un canal interno de denuncias y, si lo desea, puede ingresar su denuncia directamente en la Dirección del Trabajo.</p>
                    </ConfirmationModal>
                )}
            </div>
        </div>
    );
};

export default PublicPortal;
