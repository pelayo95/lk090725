// src/data/mockData.js
import { defaultFeaturesState, allFeatureKeys } from '../config/features';
import { defaultConfig } from '../config/defaultConfig';
import { uuidv4 } from '../utils/uuid';
import { allPermissions } from './permissions';

// ... (helpers para generar permisos no cambian)

/**
 * Simula la base de datos de la aplicación.
 */
export const initialData = {
  // ... (holidays, plans, companies, users, complaints, configurations no cambian)
  
  // Nueva colección para plantillas de comunicación
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
    // ... (roles existentes no cambian, pero el rol de admin ahora tendrá el nuevo permiso)
  }
};
