// src/pages/admin/AdminPortal.jsx
import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import AdminLayout from './AdminLayout';
import Dashboard from './Dashboard';
import CaseDetailPage from './CaseDetailPage';
import UserManagementPage from './UserManagementPage';
import SettingsPage from './SettingsPage';
import SupportPage from './SupportPage';
import DocumentationPage from './DocumentationPage';

const AdminPortal = () => {
    const { user } = useAuth();
    const { companies, plans } = useData();

    const userCompany = useMemo(() => companies.find(c => c.id === user.companyId), [companies, user]);
    const userPlan = useMemo(() => plans.find(p => p.id === userCompany?.planId), [plans, userCompany]);
    const features = userPlan?.features || {};

    const hashParts = window.location.hash.split('/');
    const view = hashParts[1] || 'dashboard';
    const caseId = hashParts[2];
    
    let content;
    if (view === 'cases' && caseId) {
        content = <CaseDetailPage caseId={caseId} />
    } else if (view === 'documentation') {
        content = <DocumentationPage />;
    } else if (view === 'users') {
        content = <UserManagementPage />;
    } else if (view === 'settings') {
        content = <SettingsPage features={features} />;
    } else if (view === 'support') {
        content = <SupportPage />;
    } else {
        content = <Dashboard />;
    }

    return (
        <AdminLayout features={features}>
            {content}
        </AdminLayout>
    );
};

export default AdminPortal;
