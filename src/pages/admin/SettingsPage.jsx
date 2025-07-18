// src/pages/admin/SettingsPage.jsx
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
// ... (otros imports)
import { Users, FileText, Brush, SlidersHorizontal } from 'lucide-react';

const SettingsPage = () => {
    const { user } = useAuth();
    const { getCompanyConfig, updateCompanyConfig } = useConfig();
    const { addToast } = useNotification();
    const [config, setConfig] = useState(() => getCompanyConfig(user.companyId));
    
    const settingCategories = useMemo(() => [
        {
            name: 'Gestión de Acceso',
            icon: <Users className="w-5 h-5 text-slate-500"/>,
            items: [
                { id: 'roles', label: 'Roles y Permisos', permission: 'config_puede_gestionar_roles', component: RoleManagementPage },
            ]
        },
        {
            name: 'Configuración de Denuncias',
            icon: <FileText className="w-5 h-5 text-slate-500"/>,
            items: [
                { id: 'form', label: 'Formulario Público', permission: 'config_puede_gestionar_formularios', component: FormSettings },
                { id: 'declaration', label: 'Declaración de Veracidad', permission: 'config_puede_gestionar_declaracion', component: DeclarationSettings },
                { id: 'timeline', label: 'Líneas de Tiempo', permission: 'config_puede_gestionar_timelines', component: TimelineSettings },
            ]
        },
        {
            name: 'Plantillas y Contenidos',
            icon: <Brush className="w-5 h-5 text-slate-500"/>,
            items: [
                { id: 'templates', label: 'Plantillas de Comunicación', permission: 'config_puede_gestionar_plantillas', component: CommunicationTemplatesSettings },
                { id: 'measures', label: 'Medidas por Defecto', permission: 'config_puede_gestionar_medidas_defecto', component: MeasuresSettings },
                { id: 'doc_categories', label: 'Categorías de Documentos', permission: 'documentacion_puede_gestionar', component: DocumentationSettings },
            ]
        },
        {
            name: 'Módulos y Automatización',
            icon: <SlidersHorizontal className="w-5 h-5 text-slate-500"/>,
            items: [
                { id: 'accused_portal', label: 'Portal del Denunciado', permission: 'config_puede_gestionar_portal_denunciado', component: AccusedPortalSettings },
                { id: 'notifications', label: 'Reglas de Notificación', permission: 'config_puede_gestionar_notificaciones', component: NotificationSettings },
            ]
        },
    ], []);

    const visibleCategories = useMemo(() => {
        return settingCategories
            .map(category => ({
                ...category,
                items: category.items.filter(item => userHasPermission(user, item.permission))
            }))
            .filter(category => category.items.length > 0);
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
            
            {/* --- INICIO DE LA MODIFICACIÓN: Layout de Grid a Flex --- */}
            <div className="md:flex md:gap-8">
                {/* Columna de Navegación Lateral Colapsable */}
                <aside className="md:w-20 hover:md:w-64 transition-all duration-300 ease-in-out mb-6 md:mb-0 md:flex-shrink-0 group">
                    <div className="space-y-6">
                        {visibleCategories.map(category => (
                            <div key={category.name}>
                                <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    {category.icon}
                                    {/* El título de la categoría se oculta/muestra */}
                                    <span className="opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">{category.name}</span>
                                </h3>
                                <div className="space-y-1">
                                    {category.items.map(item => (
                                        <button 
                                            key={item.id}
                                            onClick={() => setActiveSetting(item.id)}
                                            className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors flex items-center gap-3 ${activeSetting === item.id ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            {/* El ícono de la categoría se usa como ícono del item cuando está colapsado */}
                                            <span className="md:group-hover:hidden">{category.icon}</span>
                                            {/* El texto del item se oculta/muestra */}
                                            <span className="hidden md:group-hover:inline whitespace-nowrap">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Columna de Contenido Principal */}
                <main className="flex-grow">
                    {ActiveComponent && <ActiveComponent config={config} setConfig={setConfig} />}
                </main>
            </div>
            {/* --- FIN DE LA MODIFICACIÓN --- */}
        </div>
    );
};

export default SettingsPage;
