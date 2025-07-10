// src/pages/admin/case-details/AuditLogTab.jsx
import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Card } from '../../../components/common';
import { getUserNameById } from '../../../utils/userUtils';
import { History } from 'lucide-react';

const AuditLogTab = ({ auditLog }) => {
    const { allUsers } = useAuth();
    
    const getUserName = (userId) => {
        if (userId === 'public') return 'Denunciante Público';
        if (userId === 'system') return 'Sistema';
        return getUserNameById(userId, allUsers);
    };

    return (
        <Card>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Registro de Auditoría</h3>
            <div className="relative border-l-2 border-indigo-200 ml-3">
                {(auditLog || []).slice().reverse().map(log => (
                    <div key={log.id} className="mb-6 ml-6">
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full -left-3.5 ring-8 ring-white">
                           <History className="w-4 h-4 text-indigo-600"/>
                        </span>
                        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                            <div className="items-center justify-between sm:flex">
                                <time className="mb-1 text-xs font-normal text-slate-400 sm:order-last sm:mb-0">{new Date(log.timestamp).toLocaleString()}</time>
                                <div className="text-sm font-normal text-slate-500"><span className="font-semibold text-slate-800">{getUserName(log.userId)}</span> realizó la acción: <span className="font-medium text-slate-700">{log.action}</span></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default AuditLogTab;
