import React from 'react';
import { Card } from '../../../components/common';

const AccusedPortalSettings = ({ config, setConfig }) => {
    const handleChange = (key, value) => {
        setConfig(prev => ({
            ...prev,
            accusedPortalSettings: {
                ...prev.accusedPortalSettings,
                [key]: value
            }
        }));
    };

    return (
        <Card>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Configuración del Portal del Denunciado</h3>
            <p className="text-sm text-slate-500 mb-4">Controle qué información sensible puede ver la persona denunciada al ingresar a su portal de seguimiento.</p>
            <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-md cursor-pointer">
                    <input
                        type="checkbox"
                        checked={!!config.accusedPortalSettings?.canViewFacts}
                        onChange={e => handleChange('canViewFacts', e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                        <span className="font-medium text-slate-800">Permitir ver la descripción de los hechos</span>
                        <p className="text-xs text-slate-500">Si se activa, el denunciado podrá leer el relato completo de los hechos tal como fue ingresado por el denunciante.</p>
                    </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-md cursor-pointer">
                     <input
                        type="checkbox"
                        checked={!!config.accusedPortalSettings?.canViewEvidence}
                        onChange={e => handleChange('canViewEvidence', e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                        <span className="font-medium text-slate-800">Permitir ver la lista de pruebas del denunciante</span>
                        <p className="text-xs text-slate-500">Si se activa, el denunciado podrá ver los nombres de los archivos adjuntos por el denunciante (no podrá descargarlos).</p>
                    </div>
                </label>
            </div>
        </Card>
    );
};

export default AccusedPortalSettings;
