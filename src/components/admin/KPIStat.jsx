// src/components/admin/KPIStat.jsx
import React from 'react';
import { Card } from '../common';

const KPIStat = ({ title, value, icon }) => (
    <Card className="flex items-center gap-4">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
           {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </Card>
);

export default KPIStat;
