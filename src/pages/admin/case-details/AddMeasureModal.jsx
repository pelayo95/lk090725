// src/pages/admin/case-details/AddMeasureModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select, TextArea } from '../../../components/common';
import { ChevronLeft, Edit } from 'lucide-react';

const AddMeasureModal = ({ isOpen, onClose, onSubmit, users, defaultMeasures, editingItem }) => {
    const [view, setView] = useState(editingItem ? 'custom' : 'select');
    const [itemData, setItemData] = useState(editingItem || { text: '', assignedTo: users[0]?.uid, status: 'Discusión', startDate: '', endDate: '', description: '' });

    useEffect(() => {
        if (editingItem) {
            setItemData(editingItem);
            setView('custom');
        } else if (isOpen) {
             setItemData({ text: '', assignedTo: users[0]?.uid, status: 'Discusión', startDate: '', endDate: '', description: '' });
             setView('select');
        }
    }, [isOpen, editingItem, users]);

    const handleChange = (field, value) => setItemData(prev => ({...prev, [field]: value}));
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!itemData.text) return;
        onSubmit(itemData);
    };
    
    const handleSelectDefault = (defaultText) => {
        handleChange('text', defaultText);
        setView('custom');
    };

    return (
         <Modal isOpen={isOpen} onClose={onClose} title={editingItem ? "Editar Medida" : "Añadir Medida"}>
            {view === 'select' && !editingItem ? (
                <div className="space-y-2">
                    <p className="text-sm text-slate-600 mb-4">Seleccione una medida predefinida o ingrese una personalizada.</p>
                    {defaultMeasures.map((measure, i) => (
                        <Button key={i} variant="secondary" className="w-full justify-start" onClick={() => handleSelectDefault(measure)}>{measure}</Button>
                    ))}
                    <Button variant="primary" className="w-full justify-center" onClick={() => setView('custom')}>
                        <Edit className="w-4 h-4"/> Otra medida (personalizada)
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <TextArea label="Descripción de la Medida" id="measure-text" value={itemData.text} onChange={e => handleChange('text', e.target.value)} required />
                    <TextArea label="Detalles Adicionales (Opcional)" id="measure-desc" value={itemData.description} onChange={e => handleChange('description', e.target.value)} rows={2} />
                    <Select label="Asignar A" id="measure-assign" value={itemData.assignedTo} onChange={e => handleChange('assignedTo', e.target.value)} required>
                        {users.map(u => <option key={u.uid} value={u.uid}>{u.name}</option>)}
                    </Select>
                    <Select label="Estado" id="measure-status" value={itemData.status} onChange={e => handleChange('status', e.target.value)} required>
                        {['Discusión', 'Aprobación', 'Implementación', 'Implementada', 'Seguimiento', 'Revisión'].map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Fecha de Inicio (Opcional)" id="measure-startdate" type="date" value={itemData.startDate} onChange={e => handleChange('startDate', e.target.value)} />
                        <Input label="Fecha de Término (Opcional)" id="measure-enddate" type="date" value={itemData.endDate} onChange={e => handleChange('endDate', e.target.value)} />
                    </div>
                    <div className="flex justify-between items-center pt-4">
                         {!editingItem ? <Button type="button" onClick={() => setView('select')} variant="secondary">
                            <ChevronLeft className="w-4 h-4"/> Volver
                        </Button> : <div></div>}
                        <div className="flex gap-2">
                          <Button type="button" onClick={onClose} variant="secondary">Cancelar</Button>
                          <Button type="submit" variant="primary">{editingItem ? "Guardar Cambios" : "Añadir Medida"}</Button>
                        </div>
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default AddMeasureModal;
