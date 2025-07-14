// src/pages/admin/case-details/TimelineManagementsTab.jsx
import React from 'react';
import TimelineTab from './TimelineTab';
import ManagementsTab from './ManagementsTab';

const TimelineManagementsTab = ({ complaint, onNavigate }) => {
    return (
        <div className="space-y-6">
            <TimelineTab complaint={complaint} onNavigate={onNavigate} />
            <ManagementsTab complaint={complaint} />
        </div>
    );
};

export default TimelineManagementsTab;
