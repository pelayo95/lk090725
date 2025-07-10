// src/pages/public/ComplaintForm.jsx
import React, { useState, useMemo, useRef } from 'react';
import { useConfig } from '../../contexts/ConfigContext';
import { useData } from '../../contexts/DataContext';
import { getNestedValue, setNestedValue } from '../../utils/objectUtils';
import { Card, Button, Input, Select, TextArea } from '../../components/common';
import { RadioGroup } from '../../components/form-fields/RadioGroup';
import RutInput from '../../components/form-fields/RutInput';
import WitnessesField from '../../components/form-fields/WitnessesField';
import DocumentsField from '../../components/form-fields/DocumentsField';
import AccusedPersonsField from '../../components/form-fields/AccusedPersonsField';
import ReviewStep from './ReviewStep';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { uuidv4 } from '../../utils/uuid';

const ComplaintForm = ({ companyId, onBack, onSuccess }) => {
    const { getCompanyConfig } = useConfig();
    const { addComplaint } = useData();
    const formRef = useRef(null);

    const config = useMemo(() => getCompanyConfig(companyId), [companyId, getCompanyConfig]);
    const reviewStep = {id: 'review', title: 'Revisar y Enviar', description: 'Revise la información antes de enviar.'};
    const formSteps = useMemo(() => [...config.formSteps, reviewStep], [config.formSteps]);
        
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({ accusedPersons: [{id: uuidv4(), name: '', position: '', relacion: '', employeeType: 'Trabajador de mi misma empresa', employerName: '' }] });
    const [editingFromReview, setEditingFromReview] = useState(false);
    const [declarationAccepted, setDeclarationAccepted] = useState(false); // Nuevo estado para la declaración
        
    const today = new Date().toISOString().split("T")[0];

    const handleInputChange = (dataKey, value) => {
        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            setNestedValue(newState, dataKey, value);
            return newState;
        });
    };

    const isReviewStep = currentStep === formSteps.length - 1;

    const nextStep = () => {
        if (formRef.current && !formRef.current.checkValidity()) {
            formRef.current.reportValidity();
            return;
        }

        if (isReviewStep) {
            if (!declarationAccepted) {
                alert("Debe aceptar la declaración de veracidad para poder enviar la denuncia.");
                return;
            }
            const newComplaint = addComplaint({ originalData: formData }, companyId);
            onSuccess(newComplaint);
        } else if (editingFromReview) {
            setCurrentStep(formSteps.length - 1);
            setEditingFromReview(false);
        } else {
            setCurrentStep(prev => Math.min(prev + 1, formSteps.length - 1));
        }
    };

    const prevStep = () => {
        setEditingFromReview(false); // Always reset when going back
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const goToStep = (stepIndex) => {
        if (isReviewStep) {
            setEditingFromReview(true);
        }
        setCurrentStep(stepIndex);
    };
    
    const step = formSteps[currentStep];

   return (
        <Card>
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-700">{step.title}</h2>
                <p className="text-slate-500">{step.description}</p>
            </div>
            
            <form ref={formRef}>
                {isReviewStep ? (
                    <ReviewStep 
                        formData={formData} 
                        formSteps={config.formSteps} 
                        onEdit={goToStep}
                        declarationText={config.complaintDeclarationText}
                        declarationAccepted={declarationAccepted}
                        onDeclarationChange={setDeclarationAccepted}
                    />
                ) : (
                    <div className="space-y-4">
                        {step.fields.map(field => {
                            const value = getNestedValue(formData, field.dataKey);
                            const commonProps = {
                                key: field.id, label: field.label, id: field.id,
                                description: field.description, required: field.required
                            };
                            
                            switch (field.type) {
                                case 'textarea':
                                    return <TextArea {...commonProps} value={value || ''} onChange={e => handleInputChange(field.dataKey, e.target.value)} />;
                                case 'radio':
                                    return <RadioGroup {...commonProps} value={value} onChange={e => handleInputChange(field.dataKey, e.target.value)} options={field.options || []} name={field.dataKey} />;
                                case 'select':
                                    return <Select {...commonProps} value={value || ''} onChange={e => handleInputChange(field.dataKey, e.target.value)}><option value="">-- Seleccione --</option>{(field.options || []).map(opt => <option key={opt.value || opt} value={opt.value || opt}>{opt.value || opt}</option>)}</Select>;
                                case 'witnesses':
                                    return <WitnessesField {...commonProps} value={value} onChange={newValue => handleInputChange(field.dataKey, newValue)} />;
                                case 'documents':
                                    return <DocumentsField {...commonProps} value={value} onChange={newValue => handleInputChange(field.dataKey, newValue)} />;
                                case 'accusedPersons':
                                    return <AccusedPersonsField {...commonProps} value={value} onChange={newValue => handleInputChange(field.dataKey, newValue)} />;
                                case 'rut':
                                    return <RutInput {...commonProps} value={value || ''} onChange={e => handleInputChange(field.dataKey, e.target.value)} />;
                                case 'date':
                                    // Se añade el atributo 'max' para la validación
                                    return <Input type="date" {...commonProps} value={value || ''} onChange={e => handleInputChange(field.dataKey, e.target.value)} max={today} />;
                                default:
                                    return <Input type={field.type} {...commonProps} value={value || ''} onChange={e => handleInputChange(field.dataKey, e.target.value)} />;
                            }
                        })}
                    </div>
                )}
            </form>
            
            <div className="mt-8 flex justify-between items-center">
                {currentStep > 0 ? (
                    <Button onClick={prevStep} variant="secondary">
                        <ChevronLeft className="w-4 h-4"/> Anterior
                    </Button>
                ) : (
                    <Button onClick={onBack} variant="secondary">
                        <ChevronLeft className="w-4 h-4"/> Cambiar Empresa
                    </Button>
                )}
                <Button onClick={nextStep} variant="primary">
                    {isReviewStep ? 'Enviar Denuncia' : 'Siguiente'}
                    {!isReviewStep && <ChevronRight className="w-4 h-4"/>}
                </Button>
            </div>
        </Card>
    );
};

export default ComplaintForm;
