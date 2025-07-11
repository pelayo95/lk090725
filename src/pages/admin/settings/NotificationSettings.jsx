// src/pages/admin/settings/NotificationSettings.jsx
import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { Card, Button, Input, Select, TextArea, ConfirmationModal } from '../../../components/common';
import { AddItemModal } from '../../../components/common/AddItemModal';
import { Plus, Edit, Trash } from 'lucide-react';
import { uuidv4 } from '../../../utils/uuid';

const NotificationSettings = () => {
    const { user, allUsers } = useAuth();
    const { notificationRules, setNotificationRules } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [ruleToDelete, setRuleToDelete] = useState(null);

    const companyRules = notificationRules[user.companyId] || [];
    const companyUsers = allUsers.filter(u => u.companyId === user.companyId);

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
        { value: 'case_status_changed', label: 'Estado del Caso Cambia' },
        { value: 'new_public_message', label: 'Nuevo Mensaje de Denunciante/Denunciado' },
    ];

    const recipientOptions = [
        { value: 'all_admins', label: 'Todos los Administradores' },
        { value: 'assigned_investigators', label: 'Investigadores Asignados al Caso' },
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
                initialState={editingRule || { name: '', trigger: triggerOptions[0].value, message: '', recipients: ['all_admins'], conditions: {}, timing: {} }}
                isEditing={!!editingRule}
            >
                {(formData, handleChange) => (
                    <>
                        <Input label="Nombre de la Regla" value={formData.name} onChange={e => handleChange('name', e.target.value)} required />
                        <Select label="Activador (Cuando...)" value={formData.trigger} onChange={e => handleChange('trigger', e.target.value)}>
                            {triggerOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </Select>
                        
                        <div className="p-3 border rounded-md bg-slate-50 space-y-3">
                            <h4 className="text-sm font-semibold text-slate-600">Condiciones (Opcional)</h4>
                            {formData.trigger === 'new_case_unassigned' && (
                                <Select label="Si la gravedad es:" value={formData.conditions?.severity || 'any'} onChange={e => handleChange('conditions', {...formData.conditions, severity: e.target.value})}>
                                    <option value="any">Cualquiera</option>
                                    <option value="Leve">Leve</option>
                                    <option value="Moderado">Moderado</option>
                                    <option value="Grave">Grave</option>
                                </Select>
                            )}
                             {formData.trigger === 'case_status_changed' && (
                                <Select label="Si el nuevo estado es:" value={formData.conditions?.newStatus || 'any'} onChange={e => handleChange('conditions', {...formData.conditions, newStatus: e.target.value})}>
                                    <option value="any">Cualquiera</option>
                                    <option value="Ingresada">Ingresada</option>
                                    <option value="En Investigación">En Investigación</option>
                                    <option value="Cerrada">Cerrada</option>
                                </Select>
                            )}
                            <p className="text-xs text-slate-400">La regla solo se activará si se cumplen estas condiciones.</p>
                        </div>

                         <div className="p-3 border rounded-md bg-slate-50 space-y-3">
                             <h4 className="text-sm font-semibold text-slate-600">Tiempos (Opcional)</h4>
                             {formData.trigger === 'new_case_unassigned' && (
                                 <Input type="number" label="Notificar después de (horas):" value={formData.timing?.delayHours || ''} onChange={e => handleChange('timing', {...formData.timing, delayHours: parseInt(e.target.value) || 0})} />
                             )}
                             {formData.trigger === 'management_due_date_approaching' && (
                                 <Input type="number" label="Notificar (días) antes del vencimiento:" value={formData.timing?.daysBefore || ''} onChange={e => handleChange('timing', {...formData.timing, daysBefore: parseInt(e.target.value) || 0})} />
                             )}
                             <p className="text-xs text-slate-400">Define cuándo se debe enviar la notificación.</p>
                        </div>

                        <Select label="Destinatarios (Notificar a...)" value={formData.recipients} onChange={e => handleChange('recipients', Array.from(e.target.selectedOptions, option => option.value))} multiple>
                            {recipientOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                             {companyUsers.map(u => <option key={u.uid} value={u.uid}>{u.name} (Usuario Específico)</option>)}
                        </Select>

                        <TextArea label="Mensaje de la Notificación" value={formData.message} onChange={e => handleChange('message', e.target.value)} required rows={4} />
                        <p className="text-xs text-slate-500">Placeholders: [CODIGO_CASO], [TEXTO_GESTION], [DIAS_RESTANTES].</p>
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
