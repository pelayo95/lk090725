// src/data/mockData.js
import { defaultFeaturesState, allFeatureKeys } from '../config/features';
import { defaultConfig } from '../config/defaultConfig';
import { uuidv4 } from '../utils/uuid';

/**
 * Simula la base de datos de la aplicación.
 * En un entorno real, estos datos provendrían de una API.
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
    { uid: "boss1", email: "boss@ejemplo.com", role: "boss", companyId: null, name: "Super Admin", password: "password", lastVisited: {} },
    { uid: "adminA1", email: "admin-a@ejemplo.com", role: "admin", companyId: "empresa-a", name: "Admin A", password: "password", rut: '1.111.111-1', position: 'Gerente RRHH', phone: '+56911111111', lastVisited: {} },
  ],
  complaints: [
     {
       id: "CASO-001", companyId: "empresa-a", password: "123", status: "Cerrada", severity: "Leve",
       createdAt: "2025-04-10T09:00:00Z", closedAt: "2025-05-20T10:00:00Z", investigatorIds: ["adminA1"],
       receptionType: 'interna', internalAction: 'investigar', originalData: { case: { type: "Violencia en el Trabajo" }, complainant: { name: "Carlos Soto" }, accusedPersons: [{id: uuidv4(), name: 'Supervisor X', position: 'Supervisor', dependency: 'Gerencia', employeeType: 'Trabajador de mi misma empresa', employerName: ''}] },
       editedData: {}, managements: [], safeguardMeasures: [], internalComments: [], auditLog: [], timelineProgress: {}, caseFiles: [], sanctions: [], otherMeasures: [],
       chatMessages: [ { id: uuidv4(), text: 'Hemos recibido su caso, en breve nos pondremos en contacto.', senderId: 'adminA1', senderName: 'Admin A', timestamp: '2025-04-10T10:00:00Z' } ]
     },
  ],
  configurations: {
    "empresa-a": defaultConfig,
  }
};
