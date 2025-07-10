// src/pages/admin/settings/MeasuresSettings.jsx
import React, { useState } from 'react';
import { Card, Button, Input } from '../../../components/common';
import { Trash } from 'lucide-react';

const MeasuresSettings = ({ config, setConfig }) => {
    const [newMeasure, setNewMeasure] = useState('');

    const handleAddMeasure = (e) => {
        e.preventDefault();
        if (newMeasure.trim()) {
            const updatedMeasures = [...(config.defaultSafeguardMeasures || []), newMeasure];
            setConfig(prev => ({ ...prev, defaultSafeguardMeasures: updatedMeasures }));
            setNewMeasure('');
        }
    };
    
    const handleRemoveMeasure = (index) => {
        const updatedMeasures = [...config.defaultSafeguardMeasures];
        updatedMeasures.splice(index, 1);
        setConfig(prev => ({...prev, defaultSafeguardMeasures: updatedMeasures }));
    };

    return (
        <Card>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Medidas de Resguardo por Defecto</h3>
            <p className="text-sm text-slate-500 mb-4">Estas medidas se sugerirán al crear una nueva medida en un caso.</p>
            <form onSubmit={handleAddMeasure} className="flex gap-2 mb-4">
                <Input placeholder="Nueva medida por defecto..." value={newMeasure} onChange={e => setNewMeasure(e.target.value)} />
                <Button type="submit">Añadir</Button>
            </form>
            <div className="space-y-2">
                {(config.defaultSafeguardMeasures || []).map((measure, index) => (
                    <div key={index} className="flex justify-between items-center bg-slate-100 p-2 rounded-md">
                        <p className="text-sm">{measure}</p>
                        <Button variant="ghost" className="p-1 h-auto" onClick={() => handleRemoveMeasure(index)}><Trash className="w-4 h-4 text-red-500"/></Button>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default MeasuresSettings;
