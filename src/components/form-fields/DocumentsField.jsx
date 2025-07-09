// src/components/form-fields/DocumentsField.jsx
import React from 'react';
import { Button, Input } from '../common';
import { Plus, Trash } from 'lucide-react';
import { uuidv4 } from '../../utils/uuid';

const DocumentsField = ({ label, description, value, onChange }) => {
    const documents = Array.isArray(value) ? value : [];

    const handleDocChange = (index, field, fieldValue) => {
        const newDocs = [...documents];
        newDocs[index] = { ...newDocs[index], [field]: fieldValue };
        onChange(newDocs);
    };

    const addDocument = () => {
        onChange([...documents, { id: uuidv4(), fileName: '', description: '' }]);
    };
    
    const removeDocument = (index) => {
        onChange(documents.filter((_, i) => i !== index));
    };

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700">{label}</label>
            {description && <p className="text-xs text-slate-500 mt-1 mb-2">{description}</p>}
            <div className="space-y-4">
                {documents.map((doc, index) => (
                    <div key={doc.id} className="p-4 border rounded-md bg-slate-50 relative">
                        <div className="space-y-2">
                           <Input type="file" onChange={(e) => handleDocChange(index, 'fileName', e.target.files[0]?.name || '')} />
                           <Input label="Descripción del Documento" value={doc.description} onChange={e => handleDocChange(index, 'description', e.target.value)} />
                        </div>
                        <Button variant="ghost" className="absolute top-1 right-1 p-1 h-auto" onClick={() => removeDocument(index)}>
                            <Trash className="w-4 h-4 text-red-500" />
                        </Button>
                    </div>
                ))}
                <Button variant="secondary" onClick={addDocument}><Plus className="w-4 h-4" /> Agregar Documento</Button>
            </div>
        </div>
    )
}

export default DocumentsField;
