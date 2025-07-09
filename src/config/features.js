// src/config/features.js

/**
 * Define todas las funcionalidades disponibles en la aplicación.
 * Esta lista se utiliza para construir los planes y controlar el acceso a las características.
 */
export const allFeatures = [
    { 
        section: "Denunciante", 
        module: "Denuncia y seguimiento", 
        features: [
            { key: "formularioDenuncia", label: "Formulario de Denuncia", description: "Proceso guiado multi-paso para ingresar una denuncia. Es 100% personalizable por cada empresa desde su panel de configuración." },
            { key: "generacionCredenciales", label: "Generación de Credenciales", description: "Al finalizar la denuncia, el sistema genera automáticamente un Código de Caso y una Contraseña única de 6 dígitos." },
            { key: "portalSeguimiento", label: "Portal de Seguimiento", description: "Una sección de acceso restringido donde el denunciante puede ingresar con sus credenciales para consultar el estado de su caso." },
            { key: "visualizacionEstado", label: "Visualización de Estado", description: "El denunciante puede ver la etapa actual en la que se encuentra su caso, la cual se actualiza dinámicamente según el progreso en la línea de tiempo del gestor." },
            { key: "visualizacionMedidas", label: "Visualización de Medidas", description: "Muestra las medidas de resguardo que se han implementado y están vigentes en su caso." },
            { key: "canalComunicacionDenunciante", label: "Canal de Comunicación", description: "Un chat seguro y directo con los gestores del caso para solicitar información o aportar nuevos antecedentes." }
        ]
    },
    {
        section: "Portal de administración",
        module: "Dashboard Principal",
        features: [
            { key: "kpisYMetricas", label: "KPIs y Métricas", description: "Visualización de indicadores clave: total de casos, casos abiertos, en investigación, cerrados y tiempo promedio de resolución." },
            { key: "graficos", label: "Gráficos", description: "Gráficos de barras que muestran denuncias por estado y por gravedad." },
            { key: "filtrosAvanzados", label: "Filtros Avanzados", description: "Búsqueda por ID de caso, nombre, palabra clave y rango de fechas." },
            { key: "agendaSemanal", label: "Agenda Semanal", description: "Calendario que muestra las gestiones programadas por semana, con filtro por investigador." }
        ]
    },
    {
        section: "Portal de administración",
        module: "Gestión de Casos",
        features: [
            { key: "asignacionInvestigadores", label: "Asignación de Investigadores", description: "Permite asignar uno o más investigadores (con rol 'investigador' o 'admin') a cada caso." },
            { key: "edicionDenuncias", label: "Edición de Denuncias", description: "Los campos de la denuncia pueden ser editados por los gestores. Se mantiene un registro del valor original, que se puede consultar y revertir." },
            { key: "definicionFlujo", label: "Definición de Flujo", description: "Panel para configurar el flujo de la investigación: 'Recibida internamente' o 'Notificada por DT'." },
            { key: "planGestion", label: "Plan de Gestión", description: "Creación, asignación y seguimiento de tareas específicas con fechas de vencimiento." },
            { key: "gestionArchivos", label: "Gestión de Archivos", description: "Permite subir y clasificar documentos asociados al caso." },
            { key: "gestionSanciones", label: "Gestión de Sanciones", description: "Permite registrar y gestionar las sanciones aplicadas en un caso." },
            { key: "lineaTiempoDinamica", label: "Línea de Tiempo Dinámica", description: "El timeline se adapta al flujo definido y permite marcar etapas como completadas." },
            { key: "gestionMedidas", label: "Gestión de Medidas", description: "Creación y administración de medidas de resguardo para los involucrados." },
            { key: "comunicacionConDenunciante", label: "Comunicación con Denunciante", description: "Chat seguro y exclusivo para comunicarse con el denunciante." },
            { key: "comentariosInternos", label: "Comentarios Internos", description: "Chat privado, visible solo para los gestores del caso." },
            { key: "auditoriaCompleta", label: "Auditoría Completa", description: "Registro inmutable y detallado de cada acción realizada en el caso." }
        ]
    },
    {
        section: "Portal de administración",
        module: "Configuración",
        features: [
             { key: "gestionUsuarios", label: "Gestión de Usuarios", description: "El administrador puede crear nuevos usuarios con roles de 'Administrador' o 'Investigador'." },
             { key: "constructorFormularios", label: "Constructor de Formularios", description: "Permite crear, editar y reordenar los pasos y campos del formulario de denuncia." },
             { key: "constructorLineasTiempo", label: "Constructor de Líneas de Tiempo", description: "Permite configurar de forma independiente las etapas, sub-etapas y plazos para los 3 flujos de investigación." },
             { key: "plazosSubEtapas", label: "Plazos de Sub-etapas", description: "Posibilidad de asignar duraciones y tipos de días a cada sub-etapa." },
             { key: "medidasPorDefecto", label: "Gestión de Medidas por Defecto", description: "Permite a cada empresa crear su propia lista de medidas de resguardo predefinidas." }
        ]
    }
];

export const allFeatureKeys = allFeatures.flatMap(section => section.features.map(f => f.key));
export const defaultFeaturesState = allFeatureKeys.reduce((acc, key) => ({ ...acc, [key]: false }), {});
