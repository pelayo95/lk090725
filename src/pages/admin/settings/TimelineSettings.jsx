// src/pages/admin/settings/TimelineSettings.jsx
import React, { useState } from 'react';
import { Card, Button, Input, Select } from '../../../components/common';
import { Plus, Trash } from 'lucide-react';
import { uuidv4 } from '../../../utils/uuid';

const TimelineSettings = ({ config, setConfig }) => {
    const [activeTimeline, setActiveTimeline] = useState('interna');

    const handleStageChange = (timelineType, index, field, value) => {
        const newTimelines = { ...config.timelineSettings };
        const newStages = [...newTimelines[timelineType]];
        newStages[index] = { ...newStages[index], [field]: field === 'duration' ? parseInt(value, 10) || 0 : value };
        setConfig(prev => ({...prev, timelineSettings: {...prev.timelineSettings, [timelineType]: newStages}}));
    };
    
    const handleSubStepChange = (timelineType, stageIndex, subStepIndex, field, value) => {
        const newTimelines = { ...config.timelineSettings };
        const newStages = [...newTimelines[timelineType]];
        const newSubSteps = [...newStages[stageIndex].subSteps];
        newSubSteps[subStepIndex] = {...newSubSteps[subStepIndex], [field]: field === 'duration' ? (value === '' ? null : parseInt(value, 10) || 0) : value };
        newStages[stageIndex] = {...newStages[stageIndex], subSteps: newSubSteps};
        setConfig(prev => ({...prev, timelineSettings: {...prev.timelineSettings, [timelineType]: newStages}}));
    };

    const addSubStep = (timelineType, stageIndex) => {
        const newTimelines = { ...config.timelineSettings };
        const stage = newTimelines[timelineType][stageIndex];
        const newSubSteps = [...(stage.subSteps || []), {id: uuidv4(), name: "Nueva sub-etapa", duration: 1, dayType: 'habiles-administrativos'}];
        handleStageChange(timelineType, stageIndex, 'subSteps', newSubSteps);
    };

    const removeSubStep = (timelineType, stageIndex, subStepIndex) => {
        const newTimelines = { ...config.timelineSettings };
        const stage = newTimelines[timelineType][stageIndex];
        const newSubSteps = stage.subSteps.filter((_, i) => i !== subStepIndex);
        handleStageChange(timelineType, stageIndex, 'subSteps', newSubSteps);
    };

    const addStage = (timelineType) => {
        const newStage = { id: uuidv4(), name: 'Nueva Etapa', duration: 5, dayType: 'habiles-administrativos', countFrom: 'previous-stage-end' };
        setConfig(prev => ({...prev, timelineSettings: {...prev.timelineSettings, [timelineType]: [...(prev.timelineSettings[timelineType] || []), newStage]}}));
    };

    const removeStage = (timelineType, index) => {
        const newStages = config.timelineSettings[timelineType].filter((_, i) => i !== index);
        setConfig(prev => ({...prev, timelineSettings: {...prev.timelineSettings, [timelineType]: newStages}}));
    };

    const timelineTypes = [
        {id: 'interna', label: 'Investigación Interna'},
        {id: 'derivada', label: 'Derivada a DT'},
        {id: 'notificada', label: 'Notificada por DT'}
    ];

    const currentTimelineStages = config.timelineSettings[activeTimeline] || [];
    
    return (
        <Card>
            <div className="flex border-b mb-4 overflow-x-auto">
            {timelineTypes.map(type => (
                 <button key={type.id} onClick={() => setActiveTimeline(type.id)} className={`flex-shrink-0 px-4 py-2 text-sm font-medium ${activeTimeline === type.id ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
                     {type.label}
                 </button>
            ))}
            </div>
            
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Etapas del Proceso: {timelineTypes.find(t => t.id === activeTimeline).label}</h3>
            <div className="space-y-4">
                {currentTimelineStages.map((stage, index) => (
                    <div key={stage.id} className="p-4 border rounded-lg bg-slate-50 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                            <div className="xl:col-span-2"><Input label="Nombre Etapa" value={stage.name} onChange={e => handleStageChange(activeTimeline, index, 'name', e.target.value)} /></div>
                            <div><Input label="Plazo Total (días)" type="number" value={stage.duration} onChange={e => handleStageChange(activeTimeline, index, 'duration', e.target.value)} /></div>
                            <div><Select label="Tipo de Días" value={stage.dayType} onChange={e => handleStageChange(activeTimeline, index, 'dayType', e.target.value)}>
                                <option value="corridos">Corridos</option> <option value="habiles-administrativos">Hábiles Admin.</option>
                            </Select></div>
                            <div><Select label="Contar desde" value={stage.countFrom} onChange={e => handleStageChange(activeTimeline, index, 'countFrom', e.target.value)}>
                                <option value="case-start">Inicio del Caso</option><option value="previous-stage-end">Fin Etapa Anterior</option>
                                <option value="complaint-date">Fecha Denuncia (DT)</option><option value="reception-date">Fecha Recepción (DT)</option>
                                <option value="day-zero">Día Cero (DT)</option>
                            </Select></div>
                            <div className="flex items-end">
                                <Button variant="danger" onClick={() => removeStage(activeTimeline, index)}>
                                    <Trash className="w-4 h-4"/>
                                </Button>
                            </div>
                        </div>
                        <div className="pl-4 border-l-2 border-slate-300">
                            <h4 className="text-sm font-semibold text-slate-600 mb-2">Sub-etapas</h4>
                            <div className="space-y-2">
                                {(stage.subSteps || []).map((sub, subIndex) => (
                                    <div key={sub.id || subIndex} className="flex items-center gap-2">
                                        <Input className="flex-1" placeholder="Nombre sub-etapa" value={sub.name} onChange={e => handleSubStepChange(activeTimeline, index, subIndex, 'name', e.target.value)} />
                                        <Button variant="ghost" className="p-1 h-auto" onClick={() => removeSubStep(activeTimeline, index, subIndex)}><Trash className="w-4 h-4 text-red-500" /></Button>
                                    </div>
                                ))}
                            </div>
                            <Button onClick={() => addSubStep(activeTimeline, index)} variant="ghost" className="text-xs mt-2"><Plus className="w-3 h-3"/>Añadir Sub-etapa</Button>
                        </div>
                    </div>
                ))}
            </div>
            <Button onClick={() => addStage(activeTimeline)} variant="secondary" className="mt-4"><Plus className="w-4 h-4"/>Añadir Etapa</Button>
        </Card>
    );
};

export default TimelineSettings;
