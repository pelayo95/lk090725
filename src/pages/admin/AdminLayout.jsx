// src/pages/admin/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
    Briefcase, LogOut, LayoutDashboard, Users, Settings, LifeBuoy, Menu, FolderKanban
} from 'lucide-react';
import { userHasPermission } from '../../utils/userUtils';

const AdminLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const [activeView, setActiveView] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleNavigation = (view) => {
        setActiveView(view);
        window.location.hash = `#admin/${view}`;
        setIsSidebarOpen(false); 
    };

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.split('/')[1] || 'dashboard';
            setActiveView(hash);
        };
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5"/>, permission: ['dashboard_ver_kpis', 'casos_ver_listado', 'dashboard_ver_agenda'] },
        { id: 'documentation', label: 'Documentación', icon: <FolderKanban className="w-5 h-5"/>, permission: 'documentacion_puede_ver' },
        { id: 'users', label: 'Usuarios', icon: <Users className="w-5 h-5"/>, permission: 'config_usuarios_puede_ver_lista' },
        { id: 'support', label: 'Soporte', icon: <LifeBuoy className="w-5 h-5"/>, permission: 'soporte_puede_crear_ver_tickets' },
        { id: 'settings', label: 'Configuración', icon: <Settings className="w-5 h-5"/>, permission: ['config_puede_gestionar_roles', 'config_puede_gestionar_formularios', 'config_puede_gestionar_timelines', 'config_puede_gestionar_medidas_defecto', 'config_puede_gestionar_plantillas', 'config_puede_gestionar_notificaciones', 'documentacion_puede_gestionar'] },
    ];
    
    const SidebarContent = () => (
        <>
            <div className="h-16 flex items-center border-b border-slate-200 flex-shrink-0 px-4 overflow-hidden">
                <Briefcase className="w-8 h-8 text-indigo-600 flex-shrink-0"/>
                {/* --- MODIFICACIÓN: El texto se oculta/muestra --- */}
                <span className="ml-2 font-bold text-lg text-slate-800 whitespace-nowrap opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">Plataforma</span>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {navItems.map(item => {
                    if (!userHasPermission(user, item.permission)) return null;
                    return (
                        <a
                            key={item.id}
                            href={`#admin/${item.id}`}
                            onClick={(e) => {e.preventDefault(); handleNavigation(item.id)}}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView.startsWith(item.id) ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            {item.icon}
                            {/* --- MODIFICACIÓN: El texto se oculta/muestra --- */}
                            <span className="whitespace-nowrap opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">{item.label}</span>
                        </a>
                    )
                })}
            </nav>
            <div className="p-4 border-t border-slate-200 overflow-hidden">
                 {/* --- MODIFICACIÓN: El contenido se oculta/muestra --- */}
                <div className="flex items-center gap-3 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold flex-shrink-0">{user?.firstName?.[0] || '?'}</div>
                    <div className="whitespace-nowrap">
                        <p className="text-sm font-semibold text-slate-800">{`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}</p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                </div>
                <button onClick={logout} className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300">
                    <LogOut className="w-4 h-4"/>
                    <span className="whitespace-nowrap opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">Cerrar Sesión</span>
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-slate-100">
            {/* --- MODIFICACIÓN: Menú lateral móvil (sin cambios de lógica) --- */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Contenido del menú móvil (simplificado para claridad) */}
            </aside>
            {isSidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

            {/* --- MODIFICACIÓN: Menú lateral para escritorio ahora es colapsable --- */}
            <aside className="hidden lg:flex lg:flex-col bg-white border-r group w-20 hover:w-64 transition-all duration-300 ease-in-out">
                <SidebarContent />
            </aside>

            {/* --- MODIFICACIÓN: Contenido principal con margen dinámico --- */}
            <div className="w-full lg:pl-20 transition-all duration-300 ease-in-out">
                 <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center px-4 sticky top-0 z-10">
                    <button onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="w-6 h-6 text-slate-700"/>
                    </button>
                    <div className="flex-1 text-center font-bold text-lg text-slate-800">Plataforma</div>
                </header>
                <main className="flex-1">
                    <div className="p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
