// src/components/admin/AlertsPanel.jsx
import React from 'react';
import { Bell, FolderOpen, Clock, User, MessageSquare } from 'lucide-react';

const AlertsPanel = ({ alerts, onAlertClick }) => {
    if (!alerts || alerts.length === 0) return null;

    const alertConfig = {
        new_case: { icon: <FolderOpen className="w-5 h-5 text-blue-800"/>, color: "bg-blue-100 border-blue-500 text-blue-800" },
        deadline: { icon: <Clock className="w-5 h-5 text-red-800"/>, color: "bg-red-100 border-red-500 text-red-800" },
        assignment: { icon: <User className="w-5 h-5 text-purple-800"/>, color: "bg-purple-100 border-purple-500 text-purple-800" },
        activity: { icon: <MessageSquare className="w-5 h-5 text-green-800"/>, color: "bg-green-100 border-green-500 text-green-800" }
    };
    
    return (
        <div className="p-4 bg-white rounded-lg shadow-md mb-6 border-l-4 border-yellow-400">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <Bell className="w-6 h-6 text-yellow-500"/>
                    <h2 className="text-lg font-semibold text-slate-800">Alertas y Notificaciones</h2>
                </div>
            </div>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
                {alerts.map(alert => (
                       <li key={alert.id} className={`flex items-center gap-3 p-2 rounded-md text-sm ${alertConfig[alert.type]?.color || 'bg-slate-100'}`}>
                           {alertConfig[alert.type]?.icon || <Bell />}
                           <a href={`#admin/cases/${alert.caseId}`} onClick={() => onAlertClick && onAlertClick(alert.caseId)} className="flex-1 hover:underline">{alert.text}</a>
                           <span className="text-xs">{new Date(alert.date).toLocaleDateString()}</span>
                       </li>
                ))}
            </ul>
        </div>
    )
}

export default AlertsPanel;
