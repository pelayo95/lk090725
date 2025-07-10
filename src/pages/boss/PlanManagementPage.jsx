// src/pages/boss/PlanManagementPage.jsx
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Button, Card } from '../../components/common';
import { Plus, Edit, CheckCircle, XCircle } from 'lucide-react';
import PlanModal from './PlanModal';
import { allFeatures } from '../../config/features';
import { uuidv4 } from '../../utils/uuid';

const PlanManagementPage = () => {
    const { plans, setPlans } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);

    const handleOpenModal = (plan = null) => {
        setEditingPlan(plan);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingPlan(null);
        setIsModalOpen(false);
    };

    const handleSavePlan = (planData) => {
        setPlans(prevPlans => {
            if (editingPlan) {
                return prevPlans.map(p => p.id === editingPlan.id ? {...planData, id: editingPlan.id } : p);
            }
            return [...prevPlans, { ...planData, id: `plan-${uuidv4()}` }];
        });
        handleCloseModal();
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Gestión de Planes Comerciales</h1>
                <Button onClick={() => handleOpenModal()} variant="primary">
                    <Plus className="w-4 h-4"/> Crear Plan
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <Card key={plan.id} className="flex flex-col">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-indigo-700">{plan.name}</h3>
                            <p className="text-sm text-slate-500 mb-4">Funcionalidades incluidas:</p>
                            <ul className="space-y-2 text-sm max-h-60 overflow-y-auto pr-2">
                                {allFeatures.flatMap(s => s.features).map(feature => (
                                     <li key={feature.key} className="flex items-center gap-2">
                                        {plan.features[feature.key] ? 
                                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0"/> : 
                                            <XCircle className="w-4 h-4 text-slate-400 flex-shrink-0"/>}
                                        <span className={plan.features[feature.key] ? '' : 'text-slate-400'}>{feature.label}</span>
                                     </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button variant="secondary" onClick={() => handleOpenModal(plan)}>
                                <Edit className="w-4 h-4"/> Editar
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
            {isModalOpen && (
                <PlanModal 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSavePlan}
                    plan={editingPlan}
                />
            )}
        </div>
    );
};

export default PlanManagementPage;
