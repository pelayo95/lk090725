// src/pages/admin/settings/NotificationSettings.jsx
import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { Card, Button, Input, Select, TextArea, ConfirmationModal } from '../../../components/common';
import { AddItemModal } from '../../../components/common/AddItemModal';
import { Plus, Edit, Trash, Bell } from 'lucide-react';
import { uuidv4 } from '../../../utils/uuid';

const NotificationSettings = () => {
    const { user } = useAuth();
    const { notificationRules, setNotificationRules } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [ruleToDelete, setRuleToDelete] = useState(null);

    const companyRules = notificationRules[user.companyId] || [];

    const handleSaveRule = (ruleData) => {
        const newCompanyRules = [...companyRules];
        if (editingRule) {
            const index = newCompanyRules.findIndex(r => r.id === editingRule.id);
            newCompanyRules[index] = { ...editingRule, ...ruleData };
        } else {
            newCompanyRules.push({ ...ruleData, id: `rule_${uuidv4()}` });
        }
        setNotificationRules(prev => ({ ...prev, [user.companyId]: newCompanyRules }));
        setIsModalOpen(false);
        setEditingRule(null);
    };

    const handleDeleteRule = () => {
        if (!ruleToDelete) return;
        const newCompanyRules = companyRules.filter(r => r.id !== ruleToDelete.id);
        setNotificationRules(prev => ({ ...prev, [user.companyId]: newCompanyRules }));
        setRuleToDelete(null);
    };

    const triggerOptions = [
        { value: 'new_case_unassigned', label: 'Caso Nuevo Sin Asignar' },
        { value: 'management_due_date_approaching', label: 'Gestión por Vencer' },
    ];

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Reglas de Notificación Automática</h3>
                <Button onClick={() => { setEditingRule(null); setIsModalOpen(true); }}>
                    <Plus className="w-4 h-4"/> Crear Regla
                </Button>
            </div>
            <p className="text-sm text-slate-500 mb-4">Configure alertas automáticas para eventos específicos en la plataforma. Use placeholders como [CODIGO_CASO] o [TEXTO_GESTION] en sus mensajes.</p>
            <div className="space-y-3">
                {companyRules.map(rule => (
                    <div key={rule.id} className="p-4 bg-slate-50 rounded-md border">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold text-slate-700">{rule.name}</p>
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => { setEditingRule(rule); setIsModalOpen(true); }}>
                                    <Edit className="w-4 h-4"/>
                                </Button>
                                <Button variant="ghost" className="text-red-500" onClick={() => setRuleToDelete(rule)}>
                                    <Trash className="w-4 h-4"/>
                                </Button>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 italic">
                            Activador: {triggerOptions.find(t => t.value === rule.trigger)?.label || rule.trigger}
                        </p>
                        <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap p-2 bg-white rounded">{rule.message}</p>
                    </div>
                ))}
            </div>
            <AddItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSaveRule}
                title={editingRule ? "Editar Regla" : "Crear Regla de Notificación"}
                initialState={editingRule || { name: '', trigger: triggerOptions[0].value, message: '' }}
                isEditing={!!editingRule}
            >
                {(formData, handleChange) => (
                    <>
                        <Input label="Nombre de la Regla" value={formData.name} onChange={e => handleChange('name', e.target.value)} required />
                        <Select label="Activador (Trigger)" value={formData.trigger} onChange={e => handleChange('trigger', e.target.value)}>
                            {triggerOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </Select>
                        <TextArea label="Mensaje de la Notificación" value={formData.message} onChange={e => handleChange('message', e.target.value)} required rows={4} />
                        <p className="text-xs text-slate-500">Puede usar placeholders como [CODIGO_CASO], [TEXTO_GESTION], [DIAS_RESTANTES].</p>
                    </>
                )}
            </AddItemModal>
            {ruleToDelete && (
                 <ConfirmationModal
                    isOpen={!!ruleToDelete}
                    onClose={() => setRuleToDelete(null)}
                    onConfirm={handleDeleteRule}
                    title={`Eliminar Regla: ${ruleToDelete.name}`}
                >
                    <p>¿Está seguro de que desea eliminar esta regla de notificación? Esta acción no se puede deshacer.</p>
                </ConfirmationModal>
            )}
        </Card>
    );
};

export default NotificationSettings;
