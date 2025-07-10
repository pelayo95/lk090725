// src/pages/admin/settings/RoleEditModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select, Card } from '../../../components/common';
import { allPermissions } from '../../../data/permissions';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Helper para agrupar permisos por módulo para una mejor UI
const permissionGroups = [
    {
        title: "Dashboard",
        keys: ["dashboard_ver_kpis", "dashboard_kpis_alcance", "dashboard_ver_graficos", "dashboard_graficos_alcance", "dashboard_ver_agenda", "dashboard_agenda_alcance"]
    },
    {
        title: "Gestión de Casos (General)",
        keys: ["casos_ver_listado", "casos_listado_alcance", "casos_puede_asignar_investigadores", "casos_ver_detalles", "casos_ver_datos_denunciante", "casos_puede_editar_denuncia", "casos_puede_definir_flujo"]
    },
    {
        title: "Gestiones del Plan",
        keys: ["gestiones_puede_ver", "gestiones_puede_crear", "gestiones_puede_editar_asignar", "gestiones_puede_marcar_completa", "gestiones_puede_eliminar"]
    },
    {
        title: "Archivos del Caso",
        keys: ["archivos_puede_ver_descargar", "archivos_puede_subir", "archivos_puede_editar_clasificar", "archivos_puede_eliminar"]
    },
    {
        title: "Línea de Tiempo",
        keys: ["timeline_puede_ver", "timeline_puede_marcar_etapas"]
    },
    {
        title: "Medidas de Resguardo",
        keys: ["medidas_puede_ver", "medidas_puede_crear", "medidas_puede_editar", "medidas_puede_cambiar_estado"]
    },
    {
        title: "Sanciones y Otras Medidas",
        keys: ["sanciones_puede_ver", "sanciones_puede_crear_editar", "sanciones_puede_eliminar"]
    },
    {
        title: "Comunicaciones",
        keys: ["comunicacion_denunciante_puede_ver", "comunicacion_denunciante_puede_enviar", "comentarios_internos_puede_ver", "comentarios_internos_puede_enviar"]
    },
    {
        title: "Auditoría",
        keys: ["auditoria_puede_ver"]
    },
    {
        title: "Configuración",
        keys: ["config_puede_gestionar_roles", "config_usuarios_puede_ver_lista", "config_usuarios_puede_crear", "config_usuarios_puede_asignar_rol", "config_usuarios_puede_eliminar", "config_puede_gestionar_formularios", "config_puede_gestionar_timelines", "config_puede_gestionar_medidas_defecto"]
    }
];

const PermissionGroup = ({ title, isOpen, onToggle, children }) => {
    return (
        <Card className="p-0 overflow-hidden border border-slate-200">
            <button type="button" onClick={onToggle} className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
                <h4 className="font-semibold text-slate-800 text-left">{title}</h4>
                {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500"/> : <ChevronDown className="w-5 h-5 text-slate-500"/>}
            </button>
            {isOpen && (
                <div className="p-4 bg-white">
                    {children}
                </div>
            )}
        </Card>
    );
}

const RoleEditModal = ({ isOpen, onClose, onSave, role }) => {
    const [name, setName] = useState('');
    const [permissions, setPermissions] = useState({});
    const [openSections, setOpenSections] = useState({});

    useEffect(() => {
        if (role) {
            setName(role.name);
            setPermissions(role.permissions || {});
        } else {
            setName('');
            setPermissions({});
        }
        // Al abrir el modal, solo la primera sección está abierta por defecto.
        const initialOpenState = {};
        permissionGroups.forEach((group, index) => {
            initialOpenState[group.title] = index === 0;
        });
        setOpenSections(initialOpenState);
    }, [role, isOpen]);

    const handleToggleSection = (title) => {
        setOpenSections(prev => ({...prev, [title]: !prev[title]}));
    };

    const handlePermissionChange = (key, value) => {
        setPermissions(prev => ({ ...prev, [key]: value }));
    };

    const handleToggleAll = (keys, shouldSelect) => {
        const booleanKeys = keys.filter(k => !k.includes('_alcance'));
        const newPermissions = { ...permissions };
        booleanKeys.forEach(key => {
            newPermissions[key] = shouldSelect;
        });
        setPermissions(newPermissions);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ name, permissions });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={role ? `Editando Rol: ${role.name}` : 'Crear Nuevo Rol'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input label="Nombre del Rol" value={name} onChange={e => setName(e.target.value)} required />
                
                <div className="space-y-4 max-h-[60vh] overflow-y-auto p-2 bg-slate-50 rounded-lg border">
                    {permissionGroups.map((group) => {
                        const booleanPermissions = group.keys.filter(k => !k.includes('_alcance'));
                        const scopePermissions = group.keys.filter(k => k.includes('_alcance'));
                        const allSelected = booleanPermissions.length > 0 && booleanPermissions.every(k => permissions[k]);

                        return (
                            <PermissionGroup 
                                key={group.title}
                                title={group.title}
                                isOpen={!!openSections[group.title]}
                                onToggle={() => handleToggleSection(group.title)}
                            >
                                {booleanPermissions.length > 0 && (
                                    <div className="border-b pb-4 mb-4">
                                        <div className="flex justify-end mb-3">
                                            <Button type="button" variant="secondary" size="sm" onClick={() => handleToggleAll(group.keys, !allSelected)}>
                                                {allSelected ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                                            {booleanPermissions.map(key => (
                                                <label key={key} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-md cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!permissions[key]}
                                                        onChange={e => handlePermissionChange(key, e.target.checked)}
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-sm text-slate-700">{allPermissions[key]}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {scopePermissions.length > 0 && (
                                     <div className="space-y-4">
                                        {scopePermissions.map(key => {
                                            const options = key.includes('agenda') ? ['propia', 'empresa'] : ['todos', 'asignados', 'propios'];
                                            return (
                                                <div key={key}>
                                                    <Select
                                                        label={allPermissions[key]}
                                                        value={permissions[key] || options[0]}
                                                        onChange={e => handlePermissionChange(key, e.target.value)}
                                                    >
                                                        {options.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                                                    </Select>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </PermissionGroup>
                        );
                    })}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" onClick={onClose} variant="secondary">Cancelar</Button>
                    <Button type="submit" variant="primary">Guardar Rol</Button>
                </div>
            </form>
        </Modal>
    );
};

export default RoleEditModal;
