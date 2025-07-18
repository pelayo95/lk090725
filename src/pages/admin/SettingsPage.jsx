// src/pages/admin/SettingsPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useConfig } from '../../contexts/ConfigContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Button } from '../../components/common';
import { useLocalStorage } from '../../hooks/useLocalStorage';
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

import { Users, FileText, Brush, SlidersHorizontal, ChevronsLeft, ChevronsRight } from 'lucide-react';

const SettingsPage = () => {
    const { user } = useAuth();
    const { getCompanyConfig, updateCompanyConfig } = useConfig();
    const { addToast } = useNotification();
    const [config, setConfig] = useState(() => getCompanyConfig(user.companyId));
    const [isSettingsSidebarExpanded, setIsSettingsSidebarExpanded] = useLocalStorage('settingsSidebarExpanded', true);
    
    const settingCategories = useMemo(() => [
        { name: 'Gestión de Acceso', icon: <Users className="w-5 h-5 text-slate-600"/>, items: [{ id: 'roles', label: 'Roles y Permisos', permission: 'config_puede_gestionar_roles', component: RoleManagementPage }] },
        { name: 'Configuración de Denuncias', icon: <FileText className="w-5 h-5 text-slate-600"/>, items: [
            { id: 'form', label: 'Formulario Público', permission: 'config_puede_gestionar_formularios', component: FormSettings },
            { id: 'declaration', label: 'Declaración de Veracidad', permission: 'config_puede_gestionar_declaracion', component: DeclarationSettings },
            { id: 'timeline', label: 'Líneas de Tiempo', permission: 'config_puede_gestionar_timelines', component: TimelineSettings },
        ]},
        { name: 'Plantillas y Contenidos', icon: <Brush className="w-5 h-5 text-slate-600"/>, items: [
            { id: 'templates', label: 'Plantillas de Comunicación', permission: 'config_puede_gestionar_plantillas', component: CommunicationTemplatesSettings },
            { id: 'measures', label: 'Medidas por Defecto', permission: 'config_puede_gestionar_medidas_defecto', component: MeasuresSettings },
            { id: 'doc_categories', label: 'Categorías de Documentos', permission: 'documentacion_puede_gestionar', component: DocumentationSettings },
        ]},
        { name: 'Módulos y Automatización', icon: <SlidersHorizontal className="w-5 h-5 text-slate-600"/>, items: [
            { id: 'accused_portal', label: 'Portal del Denunciado', permission: 'config_puede_gestionar_portal_denunciado', component: AccusedPortalSettings },
            { id: 'notifications', label: 'Reglas de Notificación', permission: 'config_puede_gestionar_notificaciones', component: NotificationSettings },
        ]},
    ], []);

    const visibleCategories = useMemo(() => {
        return settingCategories.map(category => ({
            ...category,
            items: category.items.filter(item => userHasPermission(user, item.permission))
        })).filter(category => category.items.length > 0);
    }, [user, settingCategories]);
    
    const [activeSetting, setActiveSetting] = useState(() => visibleCategories[0]?.items[0]?.id || '');
    
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
                <Button onClick={handleSave} variant="primary">
                    Guardar Cambios
                </Button>
            </div>
            
            <div className="md:flex md:gap-8 items-start relative">
                <button 
                    onClick={() => setIsSettingsSidebarExpanded(!isSettingsSidebarExpanded)}
                    className="hidden md:block absolute -left-4 top-0 z-10 bg-white border border-slate-300 rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 focus:outline-none"
                    title={isSettingsSidebarExpanded ? 'Colapsar menú' : 'Expandir menú'}
                >
                    {isSettingsSidebarExpanded ? <ChevronsLeft className="w-4 h-4" /> : <ChevronsRight className="w-4 h-4" />}
                </button>

                <aside className={`mb-6 md:mb-0 md:flex-shrink-0 transition-all duration-300 ease-in-out ${isSettingsSidebarExpanded ? 'md:w-64' : 'md:w-20'}`}>
                    <div className="space-y-6 overflow-hidden">
                        {visibleCategories.map(category => (
                            <div key={category.name}>
                                <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    {category.icon}
                                    <span className={`transition-opacity duration-200 whitespace-nowrap ${isSettingsSidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>{category.name}</span>
                                </h3>
                                <div className="space-y-1">
                                    {category.items.map(item => (
                                        <button 
                                            key={item.id}
                                            onClick={() => setActiveSetting(item.id)}
                                            title={isSettingsSidebarExpanded ? '' : item.label}
                                            className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors flex items-center gap-3 ${activeSetting === item.id ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            <span className="flex-shrink-0">{item.icon}</span>
                                            <span className={`whitespace-nowrap transition-opacity duration-200 ${isSettingsSidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>{item.label}</span>
                                        </button>
                                    ))}
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
