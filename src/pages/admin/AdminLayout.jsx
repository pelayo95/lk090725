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
    
    // El contenido del menú se mantiene igual, pero lo separamos para más claridad
    const SidebarContent = () => (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="h-16 flex items-center border-b border-slate-200 flex-shrink-0 px-4">
                <Briefcase className="w-8 h-8 text-indigo-600 flex-shrink-0"/>
                <span className="ml-2 font-bold text-lg text-slate-800 whitespace-nowrap">{ "Plataforma" }</span>
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
                            <span className="flex-shrink-0">{item.icon}</span>
                            <span className="whitespace-nowrap">{item.label}</span>
                        </a>
                    )
                })}
            </nav>
            <div className="p-4 border-t border-slate-200 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold flex-shrink-0">{user?.firstName?.[0] || '?'}</div>
                    <div className="whitespace-nowrap overflow-hidden">
                        <p className="text-sm font-semibold text-slate-800 truncate">{`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                </div>
                <button onClick={logout} className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300">
                    <LogOut className="w-4 h-4 flex-shrink-0"/>
                    <span className="whitespace-nowrap">Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="relative min-h-screen bg-slate-100">
            {/* --- INICIO DE LA MODIFICACIÓN --- */}

            {/* Menú lateral para móvil (superpuesto, sin cambios) */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent />
            </aside>
            {isSidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

            {/* Menú lateral para ESCRITORIO, ahora es colapsable y se superpone */}
            <aside className="hidden lg:block fixed inset-y-0 left-0 z-30 w-20 hover:w-64 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out overflow-hidden">
                <SidebarContent />
            </aside>
            
            {/* Contenido principal con un margen izquierdo FIJO para el menú colapsado */}
            <div className="lg:pl-20">
                 <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center px-4 sticky top-0 z-20">
                    <button onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="w-6 h-6 text-slate-700"/>
                    </button>
                    <div className="flex-1 text-center font-bold text-lg text-slate-800">Plataforma</div>
                </header>
                <main>
                    <div className="p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
            {/* --- FIN DE LA MODIFICACIÓN --- */}
        </div>
    );
};

export default AdminLayout;
