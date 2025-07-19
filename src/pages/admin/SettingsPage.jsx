// src/pages/admin/SettingsPage.jsx
import React, { useState, useMemo } from 'react';
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

    // Se eliminó toda la lógica de estado (useState, useEffect, useRef) para el menú colapsable.

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

             <div className="md:flex md:gap-8 items-start">
                 {/* El menú ahora tiene un ancho fijo y no tiene lógica de hover */}
                 <aside className="bg-transparent md:flex-shrink-0 md:w-64 mb-6 md:mb-0">
                     <div className="space-y-4 p-2">
                         {visibleCategories.map(category => (
                             <div key={category.name}>
                                 <h3 className="mb-2 px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                                     {React.cloneElement(category.icon, { className: 'w-5 h-5 flex-shrink-0 text-slate-600' })}
                                     <span className="whitespace-nowrap">{category.name}</span>
                                 </h3>
                                 <div className="space-y-1">
                                     {category.items.map(item => {
                                         const isActive = activeSetting === item.id;
                                         return (
                                             <button
                                                 key={item.id}
                                                 onClick={() => setActiveSetting(item.id)}
                                                 title={item.label}
                                                 className={`w-full text-sm py-2 px-3 rounded-md transition-colors flex items-center gap-3 ${isActive ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}
                                             >
                                                 {React.cloneElement(item.icon, {
                                                     className: `w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-700' : 'text-slate-500'}`
                                                 })}
                                                 <span className="whitespace-nowrap">{item.label}</span>
                                             </button>
                                         );
                                     })}
                                 </div>
                             </div>
                         ))}
                     </div>
                 </aside>

                 <main className="flex-grow min-w-0">
                     {ActiveComponent && <ActiveComponent config={config} setConfig={setConfig} />}
                 </main>
             </div>
        </div>
    );
};

export default SettingsPage;
