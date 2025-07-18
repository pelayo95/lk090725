// src/pages/admin/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useConfig } from '../../contexts/ConfigContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Button } from '../../components/common';
import FormSettings from './settings/FormSettings';
import TimelineSettings from './settings/TimelineSettings';
import MeasuresSettings from './settings/MeasuresSettings';
import RoleManagementPage from './settings/RoleManagementPage';
import CommunicationTemplatesSettings from './settings/CommunicationTemplatesSettings';
import NotificationSettings from './settings/NotificationSettings';
import DeclarationSettings from './settings/DeclarationSettings';
import AccusedPortalSettings from './settings/AccusedPortalSettings';
import DocumentationSettings from './settings/DocumentationSettings';
import { FileText, Clock, Shield, Users, MessageSquare, Bell, AlertTriangle, Eye, LayoutList } from 'lucide-react';
import { userHasPermission } from '../../utils/userUtils';

const SettingsPage = () => {
    const { user } = useAuth();
    const { getCompanyConfig, updateCompanyConfig } = useConfig();
    const { addToast } = useNotification();
    const [config, setConfig] = useState(() => getCompanyConfig(user.companyId));
    
    const tabs = [
        { id: 'roles', label: 'Roles', icon: <Users className="w-5 h-5"/>, feature: 'config_puede_gestionar_roles', component: RoleManagementPage },
        { id: 'doc_categories', label: 'Categorías Docs', icon: <LayoutList className="w-5 h-5"/>, feature: 'documentacion_puede_gestionar', component: DocumentationSettings },
        { id: 'templates', label: 'Plantillas', icon: <MessageSquare className="w-5 h-5"/>, feature: 'config_puede_gestionar_plantillas', component: CommunicationTemplatesSettings },
        { id: 'notifications', label: 'Notificaciones', icon: <Bell className="w-5 h-5"/>, feature: 'config_puede_gestionar_notificaciones', component: NotificationSettings },
        { id: 'form', label: 'Formulario', icon: <FileText className="w-5 h-5"/>, feature: 'config_puede_gestionar_formularios', component: FormSettings },
        { id: 'declaration', label: 'Declaración', icon: <AlertTriangle className="w-5 h-5"/>, feature: 'config_puede_gestionar_declaracion', component: DeclarationSettings },
        { id: 'accused_portal', label: 'Portal Denunciado', icon: <Eye className="w-5 h-5"/>, feature: 'config_puede_gestionar_portal_denunciado', component: AccusedPortalSettings },
        { id: 'timeline', label: 'Línea de Tiempo', icon: <Clock className="w-5 h-5"/>, feature: 'config_puede_gestionar_timelines', component: TimelineSettings },
        { id: 'measures', label: 'Medidas', icon: <Shield className="w-5 h-5"/>, feature: 'config_puede_gestionar_medidas_defecto', component: MeasuresSettings },
    ];

    const visibleTabs = tabs.filter(tab => userHasPermission(user, tab.feature));
    const [activeTab, setActiveTab] = useState(visibleTabs[0]?.id || '');
    
    const handleSave = () => {
        updateCompanyConfig(user.companyId, config);
        addToast("Configuración guardada con éxito.", "success");
    };
    
    useEffect(() => {
        if(visibleTabs.length > 0 && !visibleTabs.find(t => t.id === activeTab)) {
            setActiveTab(visibleTabs[0].id)
        }
    },[visibleTabs, activeTab]);

    const ActiveComponent = visibleTabs.find(tab => tab.id === activeTab)?.component;

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Configuración</h1>
                <div className="flex items-center gap-2">
                    <Button onClick={handleSave} variant="primary">
                        Guardar Cambios
                    </Button>
                </div>
            </div>
            
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {visibleTabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium ${activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            {ActiveComponent && <ActiveComponent config={config} setConfig={setConfig} />}
        </div>
    );
};

export default SettingsPage;
