// src/contexts/AuthContext.jsx
import React, { useContext, createContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useNotification } from './NotificationContext';
import { useData } from './DataContext';
import { initialData } from '../data/mockData';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Helper para generar todos los permisos para el rol de "Boss"
const generateAllPermissions = () => {
    const allPermissionKeys = [
        "dashboard_ver_kpis", "dashboard_kpis_alcance", "dashboard_ver_graficos", 
        "dashboard_graficos_alcance", "dashboard_ver_agenda", "dashboard_agenda_alcance",
        "casos_ver_listado", "casos_listado_alcance", "casos_puede_asignar_investigadores",
        "casos_ver_detalles", "casos_ver_datos_denunciante", "casos_puede_editar_denuncia",
        "casos_puede_definir_flujo", "gestiones_puede_ver", "gestiones_puede_crear",
        "gestiones_puede_editar_asignar", "gestiones_puede_marcar_completa", "gestiones_puede_eliminar",
        "archivos_puede_ver_descargar", "archivos_puede_subir", "archivos_puede_editar_clasificar",
        "archivos_puede_eliminar", "timeline_puede_ver", "timeline_puede_marcar_etapas",
        "medidas_puede_ver", "medidas_puede_crear", "medidas_puede_editar", "medidas_puede_cambiar_estado",
        "sanciones_puede_ver", "sanciones_puede_crear_editar", "sanciones_puede_eliminar",
        "comunicacion_denunciante_puede_ver", "comunicacion_denunciante_puede_enviar",
        "comentarios_internos_puede_ver", "comentarios_internos_puede_enviar", "auditoria_puede_ver",
        "config_puede_gestionar_roles", "config_usuarios_puede_ver_lista", "config_usuarios_puede_crear",
        "config_usuarios_puede_asignar_rol", "config_usuarios_puede_eliminar", "config_puede_gestionar_formularios",
        "config_puede_gestionar_timelines", "config_puede_gestionar_medidas_defecto"
    ];
    return allPermissionKeys.reduce((acc, key) => {
      if (key.includes('_alcance')) {
        acc[key] = key.includes('agenda') ? 'empresa' : 'todos';
      } else {
        acc[key] = true;
      }
      return acc;
    }, {});
};

const allPermissionsEnabled = generateAllPermissions();

export const AuthProvider = ({ children }) => {
    const { addToast } = useNotification();
    const { roles } = useData(); 
    const [user, setUser] = useLocalStorage('user', null);
    const [allUsers, setAllUsers] = useLocalStorage('users', initialData.users);

    // Efecto para enriquecer al usuario con permisos al cargar desde localStorage
    useEffect(() => {
        // Solo se ejecuta si tenemos un usuario y los datos de roles están listos.
        if (user && roles) {
            // Se ejecuta si el usuario no tiene permisos o si su objeto de permisos está vacío.
            // Esto es crucial para la recarga de la página.
            if (!user.permissions || Object.keys(user.permissions).length === 0) {
                let userPermissions = {};
                if (user.roleId === 'boss_role') {
                    userPermissions = { ...allPermissionsEnabled, isBoss: true }; 
                } else if (user.companyId && user.roleId) {
                    const companyRoles = roles[user.companyId] || [];
                    const userRole = companyRoles.find(r => r.id === user.roleId);
                    userPermissions = userRole ? userRole.permissions : {};
                }

                // Solo actualiza el estado si se encontraron nuevos permisos
                if (Object.keys(userPermissions).length > 0) {
                    setUser(prevUser => ({
                        ...prevUser,
                        permissions: userPermissions,
                    }));
                }
            }
        }
    }, [user, roles, setUser]);


    const login = (email, password) => {
        const foundUser = allUsers.find(u => u.email === email && u.password === password);
        if (!foundUser) {
            addToast('Credenciales inválidas', 'error');
            return null;
        }

        let userPermissions = {};
        if (foundUser.roleId === 'boss_role') {
            userPermissions = { ...allPermissionsEnabled, isBoss: true };
        } else {
            const companyRoles = roles[foundUser.companyId] || [];
            const userRole = companyRoles.find(r => r.id === foundUser.roleId);
            userPermissions = userRole ? userRole.permissions : {};
        }

        const enrichedUser = {
            ...foundUser,
            permissions: userPermissions
        };
        
        setUser(enrichedUser);
        addToast(`Bienvenido, ${enrichedUser.name}`, 'success');
        return enrichedUser;
    };
    
    const logout = () => {
        setUser(null);
        addToast('Sesión cerrada correctamente', 'info');
        window.location.hash = '#public';
    };
    
    const updateUser = (userId, updates) => {
        const updatedUsers = allUsers.map(u => u.uid === userId ? {...u, ...updates} : u);
        setAllUsers(updatedUsers);
        if(user && user.uid === userId) {
            setUser(prev => ({...prev, ...updates}));
        }
    }

    const value = { user, login, logout, allUsers, setAllUsers, updateUser };
    
    // Prevenimos que la aplicación se renderice hasta que el usuario esté completamente cargado con sus permisos.
    if (user && !user.permissions) {
        return <div className="flex items-center justify-center h-screen bg-slate-100 text-slate-600">Cargando permisos...</div>;
    }
    
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
