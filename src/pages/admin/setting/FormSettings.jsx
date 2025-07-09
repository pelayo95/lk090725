// src/pages/admin/settings/FormSettings.jsx
import React from 'react';
import { Card, Button, Input, Select } from '../../../components/common';
import { Plus, Trash } from 'lucide-react';
import { uuidv4 } from '../../../utils/uuid';

const FormSettings = ({ config, setConfig }) => {
    const handleStepChange = (stepIndex, field, value) => {
        const newSteps = [...config.formSteps];
        newSteps[stepIndex][field] = value;
        setConfig(prev => ({...prev, formSteps: newSteps}));
    };

    const addStep = () => {
        const newStep = { id: uuidv4(), title: 'Nuevo Paso', description: '', fields: [] };
        setConfig(prev => ({...prev, formSteps: [...prev.formSteps, newStep]}));
    };

    const addField = (stepIndex) => {
        const newField = { id: uuidv4(), label: 'Nuevo Campo', type: 'text', dataKey: `custom.${uuidv4()}`, required: false, editableOnManage: true };
        const newSteps = [...config.formSteps];
        newSteps[stepIndex].fields.push(newField);
        setConfig(prev => ({...prev, formSteps: newSteps}));
    };
    
    const handleFieldChange = (stepIndex, fieldIndex, prop, value) => {
         const newSteps = [...config.formSteps];
         let field = { ...newSteps[stepIndex].fields[fieldIndex] };
         field[prop] = value;
         
         if (prop === 'type' && (value !== 'select' && value !== 'checkbox' && value !== 'radio')) {
             delete field.options;
         } else if(prop === 'type' && (value === 'select' || value === 'checkbox' || value === 'radio')) {
             field.options = field.options || [];
         }
         newSteps[stepIndex].fields[fieldIndex] = field;
         setConfig(prev => ({...prev, formSteps: newSteps}));
    };
    
    const removeField = (stepIndex, fieldIndex) => {
        const newSteps = [...config.formSteps];
        newSteps[stepIndex].fields.splice(fieldIndex, 1);
        setConfig(prev => ({...prev, formSteps: newSteps}));
    }

    return (
        <div className="space-y-4">
             {config.formSteps.map((step, stepIndex) => (
                <Card key={step.id}>
                    <div className="space-y-2 mb-4">
                       <Input label="Título del Paso" id={`step-title-${step.id}`} value={step.title} onChange={e => handleStepChange(stepIndex, 'title', e.target.value)} />
                       <Input label="Descripción del Paso" id={`step-desc-${step.id}`} value={step.description} onChange={e => handleStepChange(stepIndex, 'description', e.target.value)} />
                    </div>

                    <h4 className="font-semibold text-slate-700 mb-2">Campos del Paso:</h4>
                    <div className="space-y-3">
                        {step.fields.map((field, fieldIndex) => (
                            <div key={field.id} className="p-4 border rounded-md bg-slate-50 space-y-4">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <Input label="Etiqueta" id={`field-label-${field.id}`} value={field.label} onChange={e => handleFieldChange(stepIndex, fieldIndex, 'label', e.target.value)} />
                                  <Input label="Descripción (ayuda)" id={`field-desc-${field.id}`} value={field.description || ''} onChange={e => handleFieldChange(stepIndex, fieldIndex, 'description', e.target.value)} />
                                  <Select label="Tipo" id={`field-type-${field.id}`} value={field.type} onChange={e => handleFieldChange(stepIndex, fieldIndex, 'type', e.target.value)}>
                                      <option value="text">Texto Corto</option>
                                      <option value="textarea">Texto Largo</option>
                                      <option value="email">Email</option>
                                      <option value="tel">Teléfono</option>
                                      <option value="date">Fecha</option>
                                      <option value="radio">Selección Única (Radio)</option>
                                      <option value="rut">RUT (Autoformateado)</option>
                                      <option value="witnesses">Testigos Dinámicos</option>
                                      <option value="documents">Documentos Múltiples</option>
                                      <option value="accusedPersons">Personas Denunciadas</option>
                                  </Select>
                                  <div className="flex items-end gap-4">
                                       <label className="flex items-center gap-2 text-sm text-slate-600 pt-6"><input type="checkbox" checked={field.required} onChange={e => handleFieldChange(stepIndex, fieldIndex, 'required', e.target.checked)} /> Requerido</label>
                                       <label className="flex items-center gap-2 text-sm text-slate-600 pt-6"><input type="checkbox" checked={field.editableOnManage} onChange={e => handleFieldChange(stepIndex, fieldIndex, 'editableOnManage', e.target.checked)} /> Editable</label>
                                        <Button variant="danger" onClick={() => removeField(stepIndex, fieldIndex)} className="p-2 ml-auto">
                                           <Trash className="w-4 h-4"/>
                                        </Button>
                                  </div>
                               </div>
                            </div>
                        ))}
                    </div>
                    <Button onClick={() => addField(stepIndex)} variant="secondary" className="mt-4"><Plus className="w-4 h-4"/>Añadir Campo</Button>
                </Card>
             ))}
             <Button onClick={addStep}><Plus className="w-4 h-4"/>Añadir Paso</Button>
        </div>
    )
};

export default FormSettings;
