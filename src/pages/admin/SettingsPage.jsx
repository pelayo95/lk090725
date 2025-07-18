// src/pages/admin/SettingsPage.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useConfig } from '../../contexts/ConfigContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Button } from '../../components/common';
import { userHasPermission } from '../../utils/userUtils';

// Importar todos los componentes de configuración
import RoleManagementPage from './settings/RoleManagementPage';
import FormSettings from './settings/FormSettings';
import DeclarationSettings from './settings/DeclarationSettings';
import TimelineSettings from './settings/TimelineSettings';
import CommunicationTemplatesSettings from './settings/CommunicationTemplatesSettings';
import MeasuresSettings from './settings/MeasuresSettings';
import DocumentationSettings from './settings/DocumentationSettings';
import AccusedPortalSettings from './settings/AccusedPortalSettings';
import NotificationSettings from './settings/NotificationSettings';

// Importar los iconos necesarios
import {
    Users, FileText, Brush, SlidersHorizontal,
    ShieldCheck, ClipboardList, AlertTriangle, Clock, MessageSquarePlus, Shield,
    LayoutList, Eye, Bell
} from 'lucide-react';

const SettingsPage = () => {
    const { user } = useAuth();
    const { getCompanyConfig, updateCompanyConfig } = useConfig();
    const { addToast } = useNotification();
    const [config, setConfig] = useState(() => getCompanyConfig(user.companyId));

    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const collapseTimeoutRef = useRef(null);

    // 1. Lógica de colapso y expansión del menú lateral
    useEffect(() => {
        // Colapsar automáticamente 3 segundos después de la carga inicial
        const initialCollapseTimer = setTimeout(() => {
            setIsSidebarExpanded(false);
        }, 3000);
        
        // Limpiar el temporizador si el componente se desmonta
        return () => clearTimeout(initialCollapseTimer);
    }, []);

    const handleMouseEnter = () => {
        if (collapseTimeoutRef.current) {
            clearTimeout(collapseTimeoutRef.current);
        }
        setIsSidebarExpanded(true);
    };

    const handleMouseLeave = () => {
        // Colapsar 3 segundos después de que el mouse sale del menú
        collapseTimeoutRef.current = setTimeout(() => {
            setIsSidebarExpanded(false);
        }, 3000);
    };

    const settingCategories = useMemo(() => [
        { name: 'Gestión de Acceso', icon: <Users className="w-5 h-5"/>, items: [{ id: 'roles', label: 'Roles y Permisos', permission: 'config_puede_gestionar_roles', component: RoleManagementPage, icon: <ShieldCheck className="w-5 h-5" /> }] },
        { name: 'Configuración de Denuncias', icon: <FileText className="w-5 h-5"/>, items: [
            { id: 'form', label: 'Formulario Público', permission: 'config_puede_gestionar_formularios', component: FormSettings, icon: <ClipboardList className="w-5 h-5" /> },
            { id: 'declaration', label: 'Declaración de Veracidad', permission: 'config_puede_gestionar_declaracion', component: DeclarationSettings, icon: <AlertTriangle className="w-5 h-5" /> },
            { id: 'timeline', label: 'Líneas de Tiempo', permission: 'config_puede_gestionar_timelines', component: TimelineSettings, icon: <Clock className="w-5 h-5" /> },
        ]},
        { name: 'Plantillas y Contenidos', icon: <Brush className="w-5 h-5"/>, items: [
            { id: 'templates', label: 'Plantillas de Comunicación', permission: 'config_puede_gestionar_plantillas', component: CommunicationTemplatesSettings, icon: <MessageSquarePlus className="w-5 h-5" /> },
            { id: 'measures', label: 'Medidas por Defecto', permission: 'config_puede_gestionar_medidas_defecto', component: MeasuresSettings, icon: <Shield className="w-5 h-5" /> },
            { id: 'doc_categories', label: 'Categorías de Documentos', permission: 'documentacion_puede_gestionar', component: DocumentationSettings, icon: <LayoutList className="w-5 h-5" /> },
        ]},
        { name: 'Módulos y Automatización', icon: <SlidersHorizontal className="w-5 h-5"/>, items: [
            { id: 'accused_portal', label: 'Portal del Denunciado', permission: 'config_puede_gestionar_portal_denunciado', component: AccusedPortalSettings, icon: <Eye className="w-5 h-5" /> },
            { id: 'notifications', label: 'Reglas de Notificación', permission: 'config_puede_gestionar_notificaciones', component: NotificationSettings, icon: <Bell className="w-5 h-5" /> },
        ]},
    ], []);

    const visibleCategories = useMemo(() => {
        return settingCategories.map(category => ({ ...category, items: category.items.filter(item => userHasPermission(user, item.permission)) }))
            .filter(category => category.items.length > 0);
    }, [user, settingCategories]);

    const [activeSetting, setActiveSetting] = useState(() => visibleCategories?.[0]?.items?.[0]?.id || '');

    const ActiveComponent = useMemo(() => {
        for (const category of visibleCategories) {
            const foundItem = category.items.find(item => item.id === activeSetting);
            if (foundItem) return foundItem.component;
        }
        return () => <p>Seleccione una opción de configuración.</p>;
    }, [activeSetting, visibleCategories]);

    const handleSave = () => {
        updateCompanyConfig(user.companyId, config);
        addToast("Configuración guardada con éxito.", "success");
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                 <h1 className="text-2xl font-bold text-slate-800">Configuración</h1>
                 <Button onClick={handleSave} variant="primary">Guardar Cambios</Button>
             </div>

             {/* 2. Contenedor principal ajustado con flexbox */}
             <div className="md:flex md:gap-8 items-start">
                 <aside
                     className={`md:flex-shrink-0 transition-all duration-300 ease-in-out mb-6 md:mb-0 ${isSidebarExpanded ? 'md:w-64' : 'md:w-20'}`}
                     onMouseEnter={handleMouseEnter}
                     onMouseLeave={handleMouseLeave}
                 >
                     <div className="space-y-4 overflow-hidden p-2">
                         {visibleCategories.map(category => (
                             <div key={category.name}>
                                 <h3 className={`mb-2 text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2 ${isSidebarExpanded ? 'px-3' : 'justify-center'}`}>
                                     {/* 3. Icono de categoría con color más oscuro */}
                                     {React.cloneElement(category.icon, { className: 'w-5 h-5 flex-shrink-0 text-slate-600' })}
                                     <span className={`whitespace-nowrap transition-opacity duration-200 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
                                         {category.name}
                                     </span>
                                 </h3>
                                 <div className="space-y-1">
                                     {category.items.map(item => {
                                         const isActive = activeSetting === item.id;
                                         return (
                                             <button
                                                 key={item.id}
                                                 onClick={() => setActiveSetting(item.id)}
                                                 title={isSidebarExpanded ? '' : item.label}
                                                 className={`w-full text-sm py-2 px-3 rounded-md transition-colors flex items-center ${isActive ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'} ${isSidebarExpanded ? 'gap-3' : 'justify-center'}`}
                                             >
                                                 {/* 4. Icono de item con color más claro */}
                                                 {React.cloneElement(item.icon, {
                                                     className: `w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-700' : 'text-slate-500'}`
                                                 })}
                                                 <span className={`whitespace-nowrap transition-opacity duration-200 ${isSidebarExpanded ? 'opacity-100 delay-100' : 'opacity-0'}`}>
                                                     {item.label}
                                                 </span>
                                             </button>
                                         );
                                     })}
                                 </div>
                             </div>
                         ))}
                     </div>
                 </aside>

                 {/* 5. Contenedor del contenido principal con min-w-0 para evitar desbordamiento */}
                 <main className="flex-grow min-w-0">
                     {ActiveComponent && <ActiveComponent config={config} setConfig={setConfig} />}
                 </main>
             </div>
        </div>
    );
};

export default SettingsPage;
