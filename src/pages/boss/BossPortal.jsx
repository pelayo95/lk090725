// src/pages/boss/BossPortal.jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common';
import { LogOut, Building, Package, LifeBuoy } from 'lucide-react';
import BossDashboard from './BossDashboard';
import PlanManagementPage from './PlanManagementPage';
import BossSettingsPage from './BossSettingsPage';
import BossSupportPage from './BossSupportPage';

const BossPortal = () => {
    const { user, logout } = useAuth();
    const view = window.location.hash.split('/')[1] || 'dashboard';

    let content;
    if (view === 'plans') {
        content = <PlanManagementPage />;
    } else if (view === 'settings') {
        content = <BossSettingsPage />;
    } else if (view === 'support') {
        content = <BossSupportPage />;
    } else {
        content = <BossDashboard />;
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                            {user?.firstName?.[0] || '?'}
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-slate-900">Panel Super-Admin</h1>
                            <p className="text-sm text-slate-500">{user?.email}</p>
                        </div>
                    </div>
                    <nav className="flex items-center gap-2">
                        <Button variant={view === 'dashboard' ? 'primary' : 'secondary'} onClick={() => window.location.hash = '#boss/dashboard'}>
                            <Building className="w-4 h-4"/> Dashboard
                        </Button>
                        <Button variant={view === 'plans' ? 'primary' : 'secondary'} onClick={() => window.location.hash = '#boss/plans'}>
                            <Package className="w-4 h-4"/> Planes
                        </Button>
                         <Button variant={view === 'settings' ? 'primary' : 'secondary'} onClick={() => window.location.hash = '#boss/settings'}>
                            <Building className="w-4 h-4"/> Empresas
                        </Button>
                        <Button variant={view === 'support' ? 'primary' : 'secondary'} onClick={() => window.location.hash = '#boss/support'}>
                            <LifeBuoy className="w-4 h-4"/> Soporte
                        </Button>
                        <Button onClick={logout} variant="ghost">
                            <LogOut className="w-4 h-4"/> Cerrar Sesión
                        </Button>
                    </nav>
                </div>
            </header>
            <main className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {content}
                </div>
            </main>
        </div>
    );
};

export default BossPortal;
