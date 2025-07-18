// src/data/permissions.js
export const allPermissions = {
  // Módulo: Dashboard
  dashboard_ver_kpis: "Ver componente de KPIs",
  dashboard_kpis_alcance: "Alcance de datos para KPIs (empresa | propios)",
  dashboard_ver_graficos: "Ver componentes de gráficos",
  dashboard_graficos_alcance: "Alcance de datos para gráficos (empresa | propios)",
  dashboard_ver_agenda: "Ver componente de Agenda Semanal",
  dashboard_agenda_alcance: "Alcance de visualización de agenda (propia | empresa)",
  
  // Módulo: Gestión de Casos
  casos_ver_listado: "Ver la lista de casos en el dashboard",
  casos_listado_alcance: "Alcance del listado de casos (todos | asignados)",
  casos_puede_asignar_investigadores: "Asignar/quitar investigadores de un caso",
  casos_ver_detalles: "Acceder a la pestaña 'Detalles' de un caso",
  casos_ver_datos_denunciante: "Ver los campos de identificación del denunciante",
  casos_puede_editar_denuncia: "Modificar los campos de la denuncia",
  casos_puede_definir_flujo: "Cambiar el origen y la acción a tomar (interna/derivada)",
  
  // Módulo: Gestiones
  gestiones_puede_ver: "Ver la lista de gestiones",
  gestiones_puede_crear: "Añadir nuevas gestiones",
  gestiones_puede_editar_asignar: "Editar texto y responsable de una gestión",
  gestiones_puede_marcar_completa: "Marcar/desmarcar una gestión como completada",
  gestiones_puede_eliminar: "Borrar una gestión",

  // --- NUEVO PERMISO AÑADIDO ---
  entrevistas_puede_gestionar: "Agendar y gestionar entrevistas",

  // Módulo: Archivos
  archivos_puede_ver_descargar: "Ver y descargar archivos de un caso",
  archivos_puede_subir: "Subir nuevos archivos",
  archivos_puede_editar_clasificar: "Editar descripción y categoría de un archivo",
  archivos_puede_eliminar: "Borrar archivos",

  // Módulo: Línea de Tiempo
  timeline_puede_ver: "Ver la pestaña de Línea de Tiempo",
  timeline_puede_marcar_etapas: "Marcar/desmarcar etapas como completadas",

  // Módulo: Medidas de Resguardo
  medidas_puede_ver: "Ver las medidas de resguardo",
  medidas_puede_crear: "Añadir nuevas medidas de resguardo",
  medidas_puede_editar: "Editar el texto de una medida",
  medidas_puede_cambiar_estado: "Cambiar el estado de una medida",

  // Módulo: Sanciones
  sanciones_puede_ver: "Ver sanciones y otras medidas",
  sanciones_puede_crear_editar: "Registrar y editar sanciones y otras medidas",
  sanciones_puede_eliminar: "Eliminar sanciones y otras medidas",

  // Módulo: Comunicaciones
  comunicacion_denunciante_puede_ver: "Leer el chat con el denunciante",
  comunicacion_denunciante_puede_enviar: "Enviar mensajes al denunciante",
  comentarios_internos_puede_ver: "Leer los comentarios internos",
  comentarios_internos_puede_enviar: "Enviar comentarios internos",

  // Módulo: Auditoría
  auditoria_puede_ver: "Acceder a la pestaña de auditoría",

  // --- NUEVOS PERMISOS AÑADIDOS ---
  documentacion_puede_ver: "Acceder al módulo de documentación",
  documentacion_puede_gestionar: "Gestionar documentos y categorías",
  // --- FIN DE NUEVOS PERMISOS ---
  
  // Módulo: Configuración
  config_puede_gestionar_roles: "Crear, editar y eliminar roles",
  config_usuarios_puede_ver_lista: "Ver la lista de usuarios de la empresa",
  config_usuarios_puede_crear: "Crear nuevos usuarios",
  config_usuarios_puede_asignar_rol: "Cambiar el rol de un usuario",
  config_usuarios_puede_eliminar: "Eliminar usuarios",
  config_puede_gestionar_formularios: "Acceder al constructor de formularios",
  config_puede_gestionar_timelines: "Acceder al constructor de líneas de tiempo",
  config_puede_gestionar_medidas_defecto: "Gestionar la lista de medidas predefinidas",
  config_puede_gestionar_plantillas: "Gestionar plantillas de comunicación",
  config_puede_gestionar_notificaciones: "Configurar reglas de notificación",
  config_puede_gestionar_declaracion: "Editar la declaración de veracidad del formulario",
  config_puede_gestionar_portal_denunciado: "Configurar portal del denunciado",
};
