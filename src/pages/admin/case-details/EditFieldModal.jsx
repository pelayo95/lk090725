// src/pages/admin/case-details/EditFieldModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '../../../components/common';

const EditFieldModal = ({ isOpen, onClose, field, onSave }) => {
    const [value, setValue] = useState(field.currentValue);

    useEffect(() => {
        setValue(field.currentValue);
    }, [field]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(value);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Editar: ${field.label}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Nuevo Valor"
                    id={`edit-${field.id}`}
                    value={value || ''}
                    onChange={(e) => setValue(e.target.value)}
                    required autoFocus
                />
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" onClick={onClose} variant="secondary">Cancelar</Button>
                    <Button type="submit" variant="primary">Guardar</Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditFieldModal;
