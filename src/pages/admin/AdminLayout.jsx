// src/pages/admin/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
    Briefcase, LogOut, LayoutDashboard, Users, Settings 
} from 'lucide-react';
import { Button } from '../../components/common';

const AdminLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const [activeView, setActiveView] = useState('dashboard');

    // ... (lógica de handleNavigation y useEffect sin cambios)

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5"/>, permission: 'dashboard_ver_kpis' },
        { id: 'users', label: 'Usuarios', icon: <Users className="w-5 h-5"/>, permission: 'config_usuarios_puede_ver_lista' },
        { 
            id: 'settings', 
            label: 'Configuración', 
            icon: <Settings className="w-5 h-5"/>, 
            // El acceso a Configuración se concede si tiene al menos uno de los permisos de configuración
            permission: [
                'config_puede_gestionar_roles', 
                'config_puede_gestionar_formularios',
                'config_puede_gestionar_timelines',
                'config_puede_gestionar_medidas_defecto'
            ]
        },
    ];

    return (
        <div className="flex h-screen bg-slate-100">
            <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col">
                {/* ... (código del header y footer del sidebar sin cambios) */}
                <nav className="flex-1 px-2 py-4 space-y-1">
                    {navItems.map(item => {
                        // Comprobar si el usuario tiene el permiso necesario
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
                {/* ... */}
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
