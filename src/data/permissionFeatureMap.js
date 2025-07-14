// src/data/permissionFeatureMap.js

/**
 * Mapea cada permiso atómico a la clave de la funcionalidad del plan correspondiente.
 * Si un permiso no depende de un plan (ej. soporte), se marca como null.
 * Esto permite generar roles dinámicamente basados en lo que la empresa ha contratado.
 */
export const permissionToFeatureMap = {
    dashboard_ver_kpis: 'kpisYMetricas',
    dashboard_kpis_alcance: 'kpisYMetricas',
    dashboard_ver_graficos: 'graficos',
    dashboard_graficos_alcance: 'graficos',
    dashboard_ver_agenda: 'agendaSemanal',
    dashboard_agenda_alcance: 'agendaSemanal',
    
    casos_ver_listado: 'kpisYMetricas',
    casos_puede_asignar_investigadores: 'asignacionInvestigadores',
    casos_ver_detalles: 'edicionDenuncias',
    casos_ver_datos_denunciante: 'edicionDenuncias',
    casos_puede_editar_denuncia: 'edicionDenuncias',
    casos_puede_definir_flujo: 'definicionFlujo',
    
    gestiones_puede_ver: 'planGestion',
    gestiones_puede_crear: 'planGestion',
    gestiones_puede_editar_asignar: 'planGestion',
    gestiones_puede_marcar_completa: 'planGestion',
    gestiones_puede_eliminar: 'planGestion',

    // --- NUEVO MAPEO AÑADIDO ---
    entrevistas_puede_gestionar: 'gestionEntrevistas',

    archivos_puede_ver_descargar: 'gestionArchivos',
    archivos_puede_subir: 'gestionArchivos',
    archivos_puede_editar_clasificar: 'gestionArchivos',
    archivos_puede_eliminar: 'gestionArchivos',

    timeline_puede_ver: 'lineaTiempoDinamica',
    timeline_puede_marcar_etapas: 'lineaTiempoDinamica',

    medidas_puede_ver: 'gestionMedidas',
    medidas_puede_crear: 'gestionMedidas',
    medidas_puede_editar: 'gestionMedidas',
    medidas_puede_cambiar_estado: 'gestionMedidas',

    sanciones_puede_ver: 'gestionSanciones',
    sanciones_puede_crear_editar: 'gestionSanciones',
    sanciones_puede_eliminar: 'gestionSanciones',

    comunicacion_denunciante_puede_ver: 'comunicacionConDenunciante',
    comunicacion_denunciante_puede_enviar: 'comunicacionConDenunciante',
    comentarios_internos_puede_ver: 'comentariosInternos',
    comentarios_internos_puede_enviar: 'comentariosInternos',

    auditoria_puede_ver: 'auditoriaCompleta',

    config_puede_gestionar_roles: 'gestionUsuarios',
    config_usuarios_puede_ver_lista: 'gestionUsuarios',
    config_usuarios_puede_crear: 'gestionUsuarios',
    config_usuarios_puede_asignar_rol: 'gestionUsuarios',
    config_usuarios_puede_eliminar: 'gestionUsuarios',
    config_puede_gestionar_formularios: 'constructorFormularios',
    config_puede_gestionar_timelines: 'constructorLineasTiempo',
    config_puede_gestionar_medidas_defecto: 'medidasPorDefecto',
    config_puede_gestionar_plantillas: 'comunicacionConDenunciante',
    config_puede_gestionar_notificaciones: 'kpisYMetricas',
    config_puede_gestionar_declaracion: 'constructorFormularios',
    
    // --- NUEVO MAPEO AÑADIDO ---
    config_puede_gestionar_portal_denunciado: 'portalDenunciado',
    
    soporte_puede_crear_ver_tickets: null,
};
