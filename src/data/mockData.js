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
  entrevistas_puede_gestionar: true,
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
    { 
      uid: "boss1", 
      email: "boss@ejemplo.com", 
      roleId: "boss_role", 
      companyId: null, 
      firstName: "Super",
      lastName: "Admin",
      rut: "",
      position: "Platform Owner",
      phone: "",
      specializedTraining: "",
      trainingDocuments: [],
      password: "password", 
      lastVisited: {} 
    },
    { 
      uid: "adminA1", 
      email: "admin-a@ejemplo.com", 
      roleId: "rol_admin_empresa_a", 
      companyId: "empresa-a", 
      firstName: "Admin",
      lastName: "A",
      rut: '1.111.111-1', 
      position: 'Gerente RRHH',
      phone: '+56911111111', 
      specializedTraining: 'Experto en Mediación Laboral y Protocolos de Acoso.',
      trainingDocuments: [],
      password: "password", 
      lastVisited: {} 
    },
    { 
      uid: "investigadorA1", 
      email: "investigador@ejemplo.com", 
      roleId: "rol_investigador_empresa_a", 
      companyId: "empresa-a", 
      firstName: "Juan",
      lastName: "Investigador",
      rut: '2.222.222-2', 
      position: 'Investigador Interno',
      phone: '+56922222222', 
      specializedTraining: 'Certificación en investigación de denuncias internas.',
      trainingDocuments: [],
      password: "password", 
      lastVisited: {} 
    },
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
       safeguardMeasures: [], 
       internalComments: [], 
       auditLog: [], 
       timelineProgress: {}, 
       caseFiles: [], 
       sanctions: [], 
       otherMeasures: [],
       chatMessages: [ 
         { 
           id: 'msg1', text: 'Esta es la descripción inicial de mi denuncia, necesito ayuda.', 
           senderId: 'complainant', senderName: 'Denunciante', timestamp: '2025-07-10T09:05:00Z' 
         },
         { 
           id: 'msg2', text: 'Hemos recibido su caso, en breve nos pondremos en contacto.', 
           senderId: 'adminA1', senderName: 'Admin A', timestamp: '2025-07-10T10:00:00Z',
           replyTo: { id: 'msg1', senderName: 'Denunciante', text: 'Esta es la descripción inicial de mi denuncia, necesito ayuda.' }
         } 
       ],
       accusedChatMessages: [],
       accusedWitnesses: [],
       interviews: [],
       costs: [],
     },
  ],
  configurations: {
    "empresa-a": defaultConfig,
  },
  communicationTemplates: {
    "empresa-a": []
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
  ],
  documentCategories: {
    "empresa-a": [
      { id: "cat-001", name: "Políticas Internas" },
      { id: "cat-002", name: "Procedimientos de Seguridad" },
      { id: "cat-003", name: "Manuales de Capacitación" }
    ]
  },
  companyDocuments: {
    "empresa-a": [
      { 
        id: "doc-001", 
        categoryId: "cat-001", 
        name: "Política de Acoso Laboral v1.2.pdf",
        uploadedAt: "2025-07-15T10:00:00Z",
        uploadedBy: "adminA1",
        url: "#"
      },
      { 
        id: "doc-002", 
        categoryId: "cat-001", 
        name: "Código de Ética y Conducta.pdf",
        uploadedAt: "2025-06-20T14:30:00Z",
        uploadedBy: "adminA1",
        url: "#"
      },
      { 
        id: "doc-003", 
        categoryId: "cat-002", 
        name: "Plan de Evacuación de Oficinas.pdf",
        uploadedAt: "2025-05-01T09:00:00Z",
        uploadedBy: "adminA1",
        url: "#"
      }
    ]
  },
  communicationTemplates: {
    "empresa-a": [
      {
        id: "tpl_001",
        name: "Acuse de Recibo (Denunciante)",
        content: "Estimado/a,\n\nHemos recibido correctamente su denuncia, registrada bajo el código [CODIGO_CASO].\n\nLe confirmamos que hemos iniciado el proceso de investigación interno de acuerdo a nuestros protocolos. Un gestor/a se pondrá en contacto con usted a la brevedad para coordinar los próximos pasos.\n\nPuede utilizar este mismo chat para aportar cualquier antecedente adicional que considere relevante.\n\nAtentamente,\nEl Equipo de Cumplimiento.",
        triggerPoint: "case_created"
      },
      {
        id: "tpl_002",
        name: "Notificación Inicial (Denunciado)",
        content: "Estimado/a,\n\nLe informamos que la empresa ha recibido una denuncia en su contra en el marco de la Ley N°21.643. Se ha iniciado una investigación interna para esclarecer los hechos, proceso durante el cual se garantizará su derecho a ser oído y a la confidencialidad.\n\nEn los próximos días, un investigador/a asignado al caso se pondrá en contacto con usted para coordinar una entrevista y entregar más detalles.\n\nAtentamente,\nEl Equipo de Cumplimiento.",
        triggerPoint: "investigators_assigned"
      },
      {
        id: "tpl_003",
        name: "Citación a Entrevista (General)",
        content: "Estimado/a,\n\nEn el marco de la investigación del caso [CODIGO_CASO], necesitamos coordinar una entrevista con usted para recoger su testimonio sobre los hechos denunciados.\n\nPor favor, indíquenos su disponibilidad horaria para los próximos días para poder agendar una reunión (presencial o telemática).\n\nQuedamos a su disposición.",
        triggerPoint: "manual"
      },
      {
        id: "tpl_004",
        name: "Notificación de Medidas de Resguardo",
        content: "Estimado/a,\n\nLe informamos que, como parte del protocolo de investigación del caso [CODIGO_CASO], y con el fin de proteger la integridad de todos los involucrados, se han determinado ciertas medidas de resguardo de carácter temporal.\n\nEstas medidas le serán comunicadas formalmente por el área de Recursos Humanos. Su objetivo es asegurar que la investigación se desarrolle en un ambiente adecuado y no constituyen una sanción.\n\nAtentamente.",
        triggerPoint: "manual"
      },
      {
        id: "tpl_005",
        name: "Cierre de Etapa de Investigación",
        content: "Estimado/a,\n\nLe comunicamos que la etapa de recopilación de antecedentes y entrevistas para el caso [CODIGO_CASO] ha concluido.\n\nEl equipo investigador procederá ahora a analizar la información para elaborar el informe de conclusiones. Le mantendremos informado/a sobre las siguientes etapas del proceso.\n\nAtentamente.",
        triggerPoint: "manual"
      },
      {
        id: "tpl_006",
        name: "Resolución Final del Caso",
        content: "Estimado/a,\n\nLe informamos que la investigación asociada al caso [CODIGO_CASO] ha finalizado y se ha emitido una resolución.\n\nLos resultados y las medidas adoptadas (si las hubiere) le serán comunicadas a través de los canales formales establecidos por la empresa.\n\nCon esto, damos por cerrado el caso en esta plataforma. Agradecemos su participación en el proceso.",
        triggerPoint: "case_closed"
      }
    ]
  },

};
