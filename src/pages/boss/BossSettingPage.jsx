// src/pages/boss/BossSettingsPage.jsx
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import CompanyManagementPage from './CompanyManagementPage';

const BossSettingsPage = () => {
    return (
        <div className="space-y-6">
            <a href="#boss/dashboard" className="text-indigo-600 hover:underline text-sm flex items-center gap-1">
                <ChevronLeft className="w-4 h-4"/> Volver al Dashboard
            </a>
            <h1 className="text-2xl font-bold text-slate-800">Configuración Global</h1>
            <CompanyManagementPage />
        </div>
    );
};

export default BossSettingsPage;
