// src/pages/admin/case-details/ExpedienteTab.jsx
import React from 'react';
import DetailsTab from './DetailsTab';
import FilesTab from './FilesTab';

const ExpedienteTab = ({ complaint }) => {
    return (
        <div className="space-y-6">
            <DetailsTab complaint={complaint} />
            <FilesTab complaint={complaint} />
        </div>
    );
};

export default ExpedienteTab;
