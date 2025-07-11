// src/data/mockData.js
import { defaultFeaturesState, allFeatureKeys } from '../config/features';
import { defaultConfig } from '../config/defaultConfig';
import { uuidv4 } from '../utils/uuid';
import { allPermissions } from './permissions';

// Helper para generar un objeto con todos los permisos activados al máximo nivel.
const generateAllPermissionsEnabled = () => {
  return Object.keys(allPermissions).reduce((acc, key) => {
    if (key.includes('_alcance')) {
      acc[key] = key.includes('agenda') ? 'empresa' : 'todos';
    } else {
      acc[key] = true;
    }
    return acc;
  }, {});
};

const allPermissionsEnabled = generateAllPermissionsEnabled();

// Objeto de permisos para el rol de Investigador por defecto.
const defaultInvestigatorPermissions = {
  ...Object.keys(allPermissions).reduce((acc, key) => ({...acc, [key]: false}), {}),
  dashboard_ver_kpis: true,
  dashboard_kpis_alcance: "propios",
  dashboard_ver_graficos: true,
  dashboard_graficos_alcance: "propios",
  dashboard_ver_agenda: true,
  dashboard_agenda_alcance: "propia",
  casos_ver_listado: true,
  casos_listado_alcance: "asignados",
  casos_ver_detalles: true,
  casos_ver_datos_denunciante: true,
  casos_puede_editar_denuncia: true,
  gestiones_puede_ver: true,
  gestiones_puede_crear: true,
  gestiones_puede_editar_asignar: true,
  gestiones_puede_marcar_completa: true,
  gestiones_puede_eliminar: true,
  archivos_puede_ver_descargar: true,
  archivos_puede_subir: true,
  archivos_puede_editar_clasificar: true,
  archivos_puede_eliminar: true,
  timeline_puede_ver: true,
  timeline_puede_marcar_etapas: true,
  medidas_puede_ver: true,
  medidas_puede_crear: true,
  medidas_puede_editar: true,
  medidas_puede_cambiar_estado: true,
  sanciones_puede_ver: true,
  sanciones_puede_crear_editar: true,
  sanciones_puede_eliminar: true,
  comunicacion_denunciante_puede_ver: true,
  comunicacion_denunciante_puede_enviar: true,
  comentarios_internos_puede_ver: true,
  comentarios_internos_puede_enviar: true,
  auditoria_puede_ver: true,
};

// Objeto de permisos para el rol de Auditor por defecto.
const defaultAuditorPermissions = {
    ...Object.keys(allPermissions).reduce((acc, key) => ({...acc, [key]: false}), {}),
    dashboard_ver_kpis: true,
    dashboard_kpis_alcance: "empresa",
    dashboard_ver_graficos: true,
    dashboard_graficos_alcance: "empresa",
    casos_ver_listado: true,
    casos_listado_alcance: "todos",
    casos_ver_detalles: true,
    casos_ver_datos_denunciante: true,
    gestiones_puede_ver: true,
    archivos_puede_ver_descargar: true,
    timeline_puede_ver: true,
    medidas_puede_ver: true,
    sanciones_puede_ver: true,
    comunicacion_denunciante_puede_ver: true,
    comentarios_internos_puede_ver: true,
    auditoria_puede_ver: true,
};

/**
 * Simula la base de datos de la aplicación.
 */
export const initialData = {
  holidays: [
    '2025-01-01', '2025-04-18', '2025-05-01', '2025-05-21', '2025-06-29',
    '2025-07-16', '2025-08-15', '2025-09-18', '2025-09-19', '2025-10-12', 
    '2025-10-27', '2025-10-31', '2025-12-08', '2025-12-25'
  ],
  plans: [
    { 
        id: 'plan-profesional', 
        name: 'Profesional', 
        features: { ...defaultFeaturesState, ...Object.fromEntries(allFeatureKeys.map(k => [k, true])) }
    },
  ],
  companies: [
    { id: "empresa-a", name: "Empresa A", legalName: "Empresa A S.A.", rut: "76.123.456-7", address: "Av. Siempre Viva 123", abbreviation: "EMPA", commercialContact: {name: 'Juan Perez', rut: '12.345.678-9', position: 'Gerente Comercial', phone: '+56912345678', email: 'juan.perez@emp-a.com'}, admin: "admin-a@ejemplo.com", status: "activo", planId: 'plan-profesional' },
  ],
  users: [
    { uid: "boss1", email: "boss@ejemplo.com", roleId: "boss_role", companyId: null, name: "Super Admin", password: "password", lastVisited: {} },
    { uid: "adminA1", email: "admin-a@ejemplo.com", roleId: "rol_admin_empresa_a", companyId: "empresa-a", name: "Admin A", password: "password", rut: '1.111.111-1', position: 'Gerente RRHH', phone: '+56911111111', lastVisited: {} },
    { uid: "investigadorA1", email: "investigador@ejemplo.com", roleId: "rol_investigador_empresa_a", companyId: "empresa-a", name: "Juan Investigador", password: "password", rut: '2.222.222-2', position: 'Investigador Interno', phone: '+56922222222', lastVisited: {} },
  ],
  complaints: [
     {
       id: "CASO-001", companyId: "empresa-a", password: "123", status: "Cerrada", severity: "Leve",
       createdAt: "2025-07-10T09:00:00Z", closedAt: "2025-07-10T10:00:00Z", investigatorIds: ["adminA1", "investigadorA1"],
       receptionType: 'interna', internalAction: 'investigar', 
       originalData: { 
         case: { type: "Violencia en el Trabajo" }, 
         complainant: { name: "Carlos Soto" }, 
         accusedPersons: [{
           id: uuidv4(), 
           name: 'Supervisor X', 
           position: 'Supervisor', 
           dependency: 'Gerencia', 
           employeeType: 'Trabajador de mi misma empresa', 
           employerName: '',
           accessCode: null,
           password: null 
         }] 
       },
       editedData: {}, 
       managements: [], 
       safeguardMeasures: [
         {
           id: uuidv4(),
           text: "Prohibición de contacto entre las partes.",
           status: "Implementada",
           assignedTo: "adminA1",
           startDate: "2025-07-11",
           endDate: "2025-08-11",
           description: "Se ha instruido a ambas partes a no tener contacto por ningún medio durante el proceso de investigación."
         }
       ], 
       internalComments: [], 
       auditLog: [], 
       timelineProgress: {}, 
       caseFiles: [], 
       sanctions: [], 
       otherMeasures: [],
       chatMessages: [ { id: uuidv4(), text: 'Hemos recibido su caso, en breve nos pondremos en contacto.', senderId: 'adminA1', senderName: 'Admin A', timestamp: '2025-07-10T10:00:00Z' } ],
       accusedChatMessages: []
     },
  ],
  configurations: {
    "empresa-a": defaultConfig,
  },
  communicationTemplates: {
    "empresa-a": [
      {
        id: "tpl_recepcion",
        name: "Confirmación de Recepción",
        triggerPoint: "al-recibir-denuncia",
        content: "Estimado/a denunciante,\n\nHemos recibido correctamente su denuncia con el código de caso [CODIGO_CASO].\n\nNuestro equipo la revisará a la brevedad y se pondrá en contacto con usted por este medio para informarle sobre los próximos pasos.\n\nAtentamente,\nEl Equipo de Gestión."
      },
      {
        id: "tpl_cierre",
        name: "Notificación de Cierre de Caso",
        triggerPoint: "al-cerrar-caso",
        content: "Estimado/a denunciante,\n\nLe informamos que la investigación asociada a su caso [CODIGO_CASO] ha concluido.\n\nSe han tomado las medidas correspondientes de acuerdo a nuestro reglamento interno. Agradecemos su confianza en nuestro canal de denuncias.\n\nAtentamente,\nEl Equipo de Gestión."
      }
    ]
  },
  roles: {
    "empresa-a": [
      {
        id: "rol_admin_empresa_a",
        name: "Administrador General",
        isDefaultAdmin: true,
        permissions: allPermissionsEnabled,
      },
      {
        id: "rol_investigador_empresa_a",
        name: "Investigador",
        isDefaultAdmin: false,
        permissions: defaultInvestigatorPermissions,
      },
      {
        id: "rol_auditor_empresa_a",
        name: "Auditor Externo",
        isDefaultAdmin: false,
        permissions: defaultAuditorPermissions,
      }
    ]
  },
  supportTickets: [
    {
      id: "TICKET-001",
      companyId: "empresa-a",
      subject: "Duda sobre configuración de roles",
      status: "Abierto",
      createdAt: "2025-07-10T10:00:00Z",
      createdBy: "adminA1",
      messages: [
        {
          id: uuidv4(),
          text: "Hola, tengo una duda sobre cómo configurar un rol para un auditor externo. ¿Me pueden ayudar?",
          senderId: "adminA1",
          senderName: "Admin A",
          timestamp: "2025-07-10T10:00:00Z"
        }
      ]
    }
  ]
};
