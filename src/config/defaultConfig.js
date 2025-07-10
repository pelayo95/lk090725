// src/config/defaultConfig.js
import { uuidv4 } from '../utils/uuid';

const legalDefinitions = {
    acosoSexual: "Acoso Sexual (Art. 2° Código del Trabajo): El que una persona realice en forma indebida, por cualquier medio, requerimientos de carácter sexual, no consentidos por quien los recibe y que amenacen o perjudiquen su situación laboral o sus oportunidades en el empleo.",
    acosoLaboral: "Acoso Laboral (Art. 2° Código del Trabajo): Toda conducta que constituya agresión u hostigamiento reiterados, ejercida por el empleador o por uno o más trabajadores, en contra de otro u otros trabajadores, por cualquier medio, y que tenga como resultado para el o los afectados su menoscabo, maltrato o humillación, o bien que amenace o perjudique su situación laboral o sus oportunidades en el empleo.",
    violenciaTrabajo: "Violencia en el Trabajo (Art. 2° Código del Trabajo): Aquellas conductas que afecten a las y los trabajadores, con ocasión de la prestación de servicios, por parte de clientes, proveedores o usuarios, entre otros."
};

/**
 * Define la configuración por defecto para una nueva empresa.
 */
export const defaultConfig = {
        complaintDeclarationText: "Declaro bajo juramento que los hechos descritos en esta denuncia son verídicos y completos según mi leal saber y entender. Comprendo que la entrega de información falsa puede acarrear consecuencias legales y/o disciplinarias.",
    formSteps: [
        { id: "s1", title: "Tipo de Conducta", description: "Seleccione el tipo de conducta que desea denunciar.", fields: [
            { 
                id: "f1", 
                label: "Tipo de Conducta", 
                type: "radio", 
                dataKey: "case.type", 
                required: true, 
                options: [
                    { value: "Acoso Sexual", definition: legalDefinitions.acosoSexual },
                    { value: "Acoso Laboral", definition: legalDefinitions.acosoLaboral },
                    { value: "Violencia en el Trabajo", definition: legalDefinitions.violenciaTrabajo }
                ], 
                description: "Elija una opción para ver su definición legal." 
            }
        ]},
        { id: "s2", title: "Identificación del Denunciante", description: "Sus datos son confidenciales y no serán revelados al denunciado.", fields: [
            { id: "f2", label: "Nombre Completo", type: "text", dataKey: "complainant.name", required: false, description: "", editableOnManage: true },
            { id: "f2a", label: "RUT", type: "rut", dataKey: "complainant.rut", required: false, description: "", editableOnManage: true },
            { id: "f3", label: "Correo Electrónico", type: "email", dataKey: "complainant.email", required: false, description: "", editableOnManage: true },
            { id: "f4", label: "Cargo / Puesto de Trabajo", type: "text", dataKey: "complainant.position", required: false, description: "", editableOnManage: true },
        ]},
        { id: "s3", title: "Identificación de la Persona Denunciada", description: "Indique quiénes son las personas involucradas.", fields: [
             { id: 'f5', label: 'Personas Denunciadas', type: 'accusedPersons', dataKey: 'accusedPersons', required: true, description: 'Puede añadir una o más personas.' }
        ]},
        { id: "s4", title: "Descripción de los Hechos", description: "Relate de forma clara y cronológica los hechos. Indique fechas, lugares y cualquier detalle relevante.", fields: [
            { id: "f7", label: "Descripción de los hechos", type: "textarea", dataKey: "facts.description", required: true, description: "", editableOnManage: true },
            { id: "f8", label: "Fecha aproximada del último hecho", type: "date", dataKey: "facts.date", required: false, description: "", editableOnManage: true },
            { id: "f9", label: "Lugar donde ocurrieron los hechos", type: "text", dataKey: "facts.place", required: false, description: "", editableOnManage: true },
        ]},
        { id: "s5", title: "Testigos y Medios de Prueba", description: "Mencione a posibles testigos y cualquier prueba que respalde su denuncia.", fields: [
             { id: "f10", label: "Testigos", type: "witnesses", dataKey: "evidence.witnesses", required: false, description: "Añada las personas que presenciaron los hechos.", editableOnManage: false },
             { id: "f11", label: "Archivos adjuntos", type: "documents", dataKey: "evidence.files", required: false, description: "Adjunte documentos o imágenes como evidencia.", editableOnManage: false },
        ]},
    ],
    timelineSettings: {
        interna: [
           { id: "ti1", name: "Recepción de denuncia", duration: 0, dayType: 'corridos', countFrom: 'case-start' },
            { id: "ti2", name: "Gestiones iniciales", duration: 3, dayType: 'habiles-administrativos', countFrom: 'previous-stage-end', subSteps: [ // Plazo actualizado
                { id: "sub1", name: "Designar investigadores", duration: 1, dayType: 'habiles-administrativos' },
                { id: "sub2", name: "Notificar recepción de denuncia", duration: 1, dayType: 'habiles-administrativos' },
                { id: "sub3", name: "Informar al denunciado sobre la denuncia", duration: 1, dayType: 'habiles-administrativos' },
                { id: "sub4", name: "Determinar medidas de resguardo", duration: 1, dayType: 'habiles-administrativos' },
                { id: "sub5", name: "Notificar medidas a partes/DT/organismo", duration: 1, dayType: 'habiles-administrativos' },
            ]},
            { id: "ti3", name: "Investigación", duration: 30, dayType: 'habiles-administrativos', countFrom: 'case-start', subSteps: [ // countFrom y plazo actualizados
                { id: "sub6", name: "Entrevistar a denunciante", duration: 5, dayType: 'habiles-administrativos' },
                { id: "sub7", name: "Entrevistar a denunciado", duration: 5, dayType: 'habiles-administrativos' },
                { id: "sub8", name: "Entrevistar a testigos", duration: 10, dayType: 'habiles-administrativos' },
                { id: "sub9", name: "Revisar prueba aportada", duration: 5, dayType: 'habiles-administrativos' },
                { id: "sub10", name: "Revisar documentación laboral", duration: 5, dayType: 'habiles-administrativos' },
                { id: "sub15", name: "Notificar término de investigación", duration: 1, dayType: 'habiles-administrativos' }
            ] },
            { id: "ti4", name: "Redacción y envío de informe", duration: 2, dayType: 'habiles-administrativos', countFrom: 'previous-stage-end' },
            { id: "ti5", name: "Revisión por Inspección del Trabajo", duration: 30, dayType: 'habiles-administrativos', countFrom: 'previous-stage-end' },
            { id: "ti6", name: "Aplicación de sanciones y medidas", duration: 15, dayType: 'corridos', countFrom: 'previous-stage-end' }
        ],
        derivada: [
            // ... (sin cambios)
        ],
        notificada: [
            // ... (sin cambios)
        ]
    },
    defaultSafeguardMeasures: [
        "Separación de espacios físicos entre las partes.",
        "Teletrabajo para la persona denunciante.",
        "Redistribución del tiempo de jornada.",
        "Prohibición de contacto entre las partes.",
        "Rotación de turnos o puestos de trabajo."
    ]
    
};
