// src/components/admin/WeeklyAgenda.jsx
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Card, Button, Select } from '../common';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WeeklyAgenda = () => {
    const { user, allUsers } = useAuth();
    const { complaints } = useData();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedUser, setSelectedUser] = useState(user.role === 'admin' ? 'all' : user.uid);

    const companyInvestigators = useMemo(() => {
        return allUsers.filter(u => u.companyId === user.companyId && (u.role === 'investigador' || u.role === 'admin'));
    }, [allUsers, user.companyId]);
    
    const {agenda, days} = useMemo(() => {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - (currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1));
        startOfWeek.setHours(0, 0, 0, 0);

        const days = Array.from({ length: 7 }, (_, i) => {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            return day;
        });

        const endOfWeek = new Date(days[6]);
        endOfWeek.setHours(23, 59, 59, 999);
        
        const agenda = days.reduce((acc, day) => {
            acc[day.toISOString().split('T')[0]] = [];
            return acc;
        }, {});

        complaints.forEach(c => {
            if (c.companyId === user.companyId) {
                (c.managements || []).forEach(m => {
                    const shouldInclude = (selectedUser === 'all') || m.assignedTo === selectedUser;
                    
                    if (shouldInclude && m.dueDate && !m.completed) {
                        const dueDate = new Date(m.dueDate + 'T00:00:00'); // Normalize
                        if (dueDate >= startOfWeek && dueDate <= endOfWeek) {
                            const dayString = dueDate.toISOString().split('T')[0];
                            if (agenda[dayString]) {
                                agenda[dayString].push({ ...m, caseId: c.id });
                            }
                        }
                    }
                });
            }
        });
        return { agenda, days };
    }, [complaints, user.companyId, currentDate, selectedUser]);

    const handlePrevWeek = () => setCurrentDate(prev => new Date(prev.setDate(prev.getDate() - 7)));
    const handleNextWeek = () => setCurrentDate(prev => new Date(prev.setDate(prev.getDate() + 7)));

    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <Card>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h2 className="text-xl font-bold text-slate-800">Agenda Semanal</h2>
                <div className="flex items-center gap-2">
                    {user.role === 'admin' && (
                        <Select id="agenda-filter" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                            <option value="all">Todos</option>
                            {companyInvestigators.map(inv => (
                                <option key={inv.uid} value={inv.uid}>{inv.name}</option>
                            ))}
                        </Select>
                    )}
                    <Button onClick={handlePrevWeek} variant="secondary"><ChevronLeft className="w-4 h-4"/></Button>
                    <Button onClick={handleNextWeek} variant="secondary"><ChevronRight className="w-4 h-4"/></Button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                {days.map(day => {
                    const dayStr = day.toISOString().split('T')[0];
                    const tasks = agenda[dayStr];
                    const isToday = dayStr === todayStr;

                    return (
                        <div key={dayStr} className={`p-2 rounded-lg ${isToday ? 'bg-indigo-50 border-2 border-indigo-200' : 'bg-slate-50'}`}>
                            <p className={`font-bold text-center text-sm ${isToday ? 'text-indigo-700' : 'text-slate-600'}`}>{day.toLocaleDateString('es-ES', { weekday: 'long' })}</p>
                            <p className="text-center text-xs text-slate-500 mb-2">{day.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</p>
                            <div className="space-y-1">
                                {tasks.length > 0 ? (
                                    tasks.map(task => (
                                        <a href={`#admin/cases/${task.caseId}`} key={task.id} className="block p-1.5 bg-white border border-slate-200 rounded-md text-xs hover:bg-slate-100 hover:border-slate-300">
                                            <p className="font-semibold text-slate-700 truncate">{task.text}</p>
                                            <p className="text-slate-500">Caso: {task.caseId}</p>
                                        </a>
                                    ))
                                ) : (
                                    <div className="text-center text-xs text-slate-400 pt-2">-</div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </Card>
    );
}

export default WeeklyAgenda;
