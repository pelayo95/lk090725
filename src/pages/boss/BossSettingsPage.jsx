// src/pages/boss/BossSettingsPage.jsx
import React from 'react';
import CompanyManagementPage from './CompanyManagementPage';

const BossSettingsPage = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Gestión de Empresas</h1>
            <CompanyManagementPage />
        </div>
    );
};

export default BossSettingsPage;
