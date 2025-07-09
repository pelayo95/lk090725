import React from 'react';
// Asumiremos que estos componentes se crearán a continuación
import BossDashboard from './BossDashboard';
import PlanManagementPage from './PlanManagementPage';
import BossSettingsPage from './BossSettingsPage';

const BossPortal = () => {
    const view = window.location.hash.split('/')[1] || 'dashboard';

    let content;
    if(view === 'plans') {
        content = <PlanManagementPage />
    } else if (view === 'settings') {
        content = <BossSettingsPage />;
    } else {
        content = <BossDashboard />;
    }

    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                 {content}
            </div>
        </div>
    );
};

export default BossPortal;
