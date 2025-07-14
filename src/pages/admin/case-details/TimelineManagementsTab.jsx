// src/pages/admin/case-details/TimelineManagementsTab.jsx
import React from 'react';
import TimelineTab from './TimelineTab';
import ManagementsTab from './ManagementsTab';

const TimelineManagementsTab = ({ complaint, onNavigate }) => {
    return (
        // --- INICIO DE LA MODIFICACIÓN ---
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <TimelineTab complaint={complaint} onNavigate={onNavigate} />
            <ManagementsTab complaint={complaint} />
        </div>
        // --- FIN DE LA MODIFICACIÓN ---
    );
};

export default TimelineManagementsTab;
