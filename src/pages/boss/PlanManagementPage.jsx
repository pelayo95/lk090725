// src/pages/boss/PlanManagementPage.jsx
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Button, Card } from '../../components/common';
import { Plus, Edit, CheckCircle, XCircle, ChevronLeft } from 'lucide-react';
import PlanModal from './PlanModal';
import { allFeatures } from '../../config/features';

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
            return [...prevPlans, { ...planData, id: `plan-${Date.now()}` }];
        });
        handleCloseModal();
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <a href="#boss/dashboard" className="text-indigo-600 hover:underline text-sm flex items-center gap-1">
                        <ChevronLeft className="w-4 h-4"/> Volver al Dashboard
                    </a>
                    <h1 className="text-2xl font-bold text-slate-800 mt-1">Gestión de Planes</h1>
                </div>
                <Button onClick={() => handleOpenModal()} variant="primary">
                    <Plus className="w-4 h-4"/> Crear Plan
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <Card key={plan.id} className="flex flex-col">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-indigo-700">{plan.name}</h3>
                            <ul className="mt-4 space-y-2 text-sm">
                                {allFeatures.flatMap(s => s.features).slice(0, 5).map(feature => ( // Show first 5 for brevity
                                     <li key={feature.key} className="flex items-center gap-2">
                                        {plan.features[feature.key] ? <CheckCircle className="w-4 h-4 text-emerald-500"/> : <XCircle className="w-4 h-4 text-red-500"/>}
                                        <span>{feature.label}</span>
                                     </li>
                                ))}
                                {allFeatures.flatMap(s => s.features).length > 5 && <li>... y más</li>}
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
