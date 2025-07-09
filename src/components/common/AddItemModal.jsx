// src/components/common/AddItemModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export const AddItemModal = ({ isOpen, onClose, onSubmit, title, initialState, children, isEditing = false }) => {
    const [formData, setFormData] = useState(initialState);
    const formRef = useRef(null);
    
    useEffect(() => {
        if (isOpen) {
            setFormData(initialState);
        }
    }, [isOpen, initialState]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formRef.current && !formRef.current.checkValidity()) {
            formRef.current.reportValidity();
            return;
        }
        onSubmit(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                {children(formData, handleChange)}
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" onClick={onClose} variant="secondary">Cancelar</Button>
                    <Button type="submit" variant="primary">{isEditing ? 'Guardar Cambios' : 'Añadir'}</Button>
                </div>
            </form>
        </Modal>
    );
};
