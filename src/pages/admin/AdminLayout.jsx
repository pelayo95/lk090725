// src/pages/admin/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
    Briefcase, LogOut, LayoutDashboard, Users, Settings, LifeBuoy
} from 'lucide-react';
import { Button } from '../../components/common';

const AdminLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const [activeView, setActiveView] = useState('dashboard');

    const handleNavigation = (view) => {
        setActiveView(view);
        window.location.hash = `#admin/${view}`;
    }

    useEffect(() => {
        const hash = window.location.hash.split('/')[1] || 'dashboard';
        setActiveView(hash);
    }, []);

    const navItems = [
        { 
            id: 'dashboard', 
            label: 'Dashboard', 
            icon: <LayoutDashboard className="w-5 h-5"/>, 
            permission: ['dashboard_ver_kpis', 'casos_ver_listado', 'dashboard_ver_agenda'] 
        },
        { id: 'users', label: 'Usuarios', icon: <Users className="w-5 h-5"/>, permission: 'config_usuarios_puede_ver_lista' },
        { id: 'support', label: 'Soporte', icon: <LifeBuoy className="w-5 h-5"/>, permission: 'soporte_puede_crear_ver_tickets' },
        { 
            id: 'settings', 
            label: 'Configuración', 
            icon: <Settings className="w-5 h-5"/>, 
            permission: [
                'config_puede_gestionar_roles', 
                'config_puede_gestionar_formularios',
                'config_puede_gestionar_timelines',
                'config_puede_gestionar_medidas_defecto',
                'config_puede_gestionar_plantillas',
                'config_puede_gestionar_notificaciones'
            ]
        },
    ];

    return (
        <div className="flex h-screen bg-slate-100">
            <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col">
                <div className="h-16 flex items-center px-4 border-b border-slate-200">
                    <Briefcase className="w-8 h-8 text-indigo-600"/>
                    <span className="ml-2 font-bold text-lg text-slate-800">Plataforma</span>
                </div>
                <nav className="flex-1 px-2 py-4 space-y-1">
                    {navItems.map(item => {
                        const hasPermission = Array.isArray(item.permission)
                            ? item.permission.some(p => user.permissions[p])
                            : user.permissions[item.permission];

                        if (!hasPermission) return null;
                        
                        return (
                            <a
                                key={item.id}
                                href={`#admin/${item.id}`}
                                onClick={(e) => {e.preventDefault(); handleNavigation(item.id)}}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView.startsWith(item.id) ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                {item.icon}
                                {item.label}
                            </a>
                        )
                    })}
                </nav>
                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">{user?.name[0]}</div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                            <p className="text-xs text-slate-500">{user?.email}</p>
                        </div>
                    </div>
                    <Button onClick={logout} variant="secondary" className="w-full mt-4">
                        <LogOut className="w-4 h-4"/>
                        Cerrar Sesión
                    </Button>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {React.cloneElement(children, { activeView, setActiveView })}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
