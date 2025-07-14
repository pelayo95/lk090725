// src/pages/admin/case-details/InterviewsTab.jsx
import React, { useState, useMemo } from 'react';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Card, Button, Input, Select, TextArea, ConfirmationModal } from '../../../components/common';
import { AddItemModal } from '../../../components/common/AddItemModal';
import { Plus, Edit, Trash, Calendar, Download } from 'lucide-react';
import { uuidv4 } from '../../../utils/uuid';

const InterviewsTab = ({ complaint }) => {
    const { updateComplaint } = useData();
    const { user, allUsers } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInterview, setEditingInterview] = useState(null);
    const [interviewToDelete, setInterviewToDelete] = useState(null);
    const [lastSavedInterview, setLastSavedInterview] = useState(null);

    const companyInvestigators = useMemo(() => {
        return allUsers.filter(u => u.companyId === complaint.companyId && (u.roleId.includes('admin') || u.roleId.includes('investigador')));
    }, [allUsers, complaint.companyId]);

    const handleOpenModal = (interview = null) => {
        setEditingInterview(interview);
        setLastSavedInterview(null);
        setIsModalOpen(true);
    };

    const handleSaveInterview = (formData) => {
        const newInterviews = [...(complaint.interviews || [])];
        let savedInterview;

        if (editingInterview) {
            const index = newInterviews.findIndex(i => i.id === editingInterview.id);
            savedInterview = { ...editingInterview, ...formData };
            newInterviews[index] = savedInterview;
        } else {
            savedInterview = { ...formData, id: `int_${uuidv4()}` };
            newInterviews.push(savedInterview);
        }

        updateComplaint(complaint.id, { interviews: newInterviews }, user);
        setLastSavedInterview(savedInterview); // Guardar para poder generar el .ics
        
        // No cerramos el modal, mostramos el botón de descarga
    };

    const handleDeleteInterview = () => {
        if (!interviewToDelete) return;
        const newInterviews = complaint.interviews.filter(i => i.id !== interviewToDelete.id);
        updateComplaint(complaint.id, { interviews: newInterviews }, user);
        setInterviewToDelete(null);
    };

    const generateICSFile = (interview) => {
        const formatDate = (date) => {
            return new Date(date).toISOString().replace(/-|:|\.\d{3}/g, "");
        };

        const startDate = formatDate(interview.scheduledDate);
        // Asumimos 1 hora de duración para la entrevista
        const endDate = formatDate(new Date(new Date(interview.scheduledDate).getTime() + 60 * 60 * 1000));

        const event = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'BEGIN:VEVENT',
            `UID:${interview.id}@yourdomain.com`,
            `DTSTAMP:${formatDate(new Date())}`,
            `DTSTART:${startDate}`,
            `DTEND:${endDate}`,
            `SUMMARY:Entrevista Caso ${complaint.id}: ${interview.intervieweeName}`,
            `DESCRIPTION:Entrevista con ${interview.intervieweeName} (${interview.intervieweeRole}) para el caso ${complaint.id}.\\nInvestigadores: ${interview.interviewers.map(uid => allUsers.find(u => u.uid === uid)?.name).join(', ')}.`,
            `LOCATION:${interview.location}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\n');

        const blob = new Blob([event], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Entrevista_${complaint.id}_${interview.intervieweeName}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Entrevistas Programadas</h3>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="w-4 h-4"/> Agendar Entrevista
                </Button>
            </div>
            <div className="space-y-3">
                {(complaint.interviews || []).map(interview => (
                    <div key={interview.id} className="p-4 bg-slate-50 rounded-md border">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-slate-800">{interview.intervieweeName} <span className="text-sm font-normal text-slate-500">({interview.intervieweeRole})</span></p>
                                <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                                    <Calendar className="w-4 h-4"/> {new Date(interview.scheduledDate).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => handleOpenModal(interview)}><Edit className="w-4 h-4"/></Button>
                                <Button variant="ghost" className="text-red-500" onClick={() => setInterviewToDelete(interview)}><Trash className="w-4 h-4"/></Button>
                            </div>
                        </div>
                         <div className="mt-2 pt-2 border-t">
                            <p className="text-xs font-semibold text-slate-500">Estado: <span className="font-bold text-slate-700">{interview.status}</span></p>
                             <p className="text-xs font-semibold text-slate-500">Lugar: <span className="font-normal text-slate-700">{interview.location}</span></p>
                            <p className="text-xs font-semibold text-slate-500">Entrevistadores: <span className="font-normal text-slate-700">{interview.interviewers.map(uid => allUsers.find(u => u.uid === uid)?.name || uid).join(', ')}</span></p>
                        </div>
                    </div>
                ))}
                {(complaint.interviews || []).length === 0 && <p className="text-sm text-center text-slate-500 py-4">No hay entrevistas programadas.</p>}
            </div>

            <AddItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSaveInterview}
                title={editingInterview ? "Editar Entrevista" : "Agendar Nueva Entrevista"}
                initialState={editingInterview || { intervieweeName: '', intervieweeRole: 'Testigo', scheduledDate: '', location: '', status: 'Programada', interviewers: [user.uid], summary: '' }}
                isEditing={!!editingInterview}
                hideSubmit={!!lastSavedInterview} // Ocultar botón de guardar si ya se guardó
            >
                {(formData, handleChange) => (
                    <>
                        {!lastSavedInterview ? (
                            <>
                                <Input label="Nombre del Entrevistado" value={formData.intervieweeName} onChange={e => handleChange('intervieweeName', e.target.value)} required />
                                <Select label="Rol del Entrevistado" value={formData.intervieweeRole} onChange={e => handleChange('intervieweeRole', e.target.value)}>
                                    <option>Testigo</option><option>Denunciante</option><option>Denunciado</option><option>Otro</option>
                                </Select>
                                <Input type="datetime-local" label="Fecha y Hora" value={formData.scheduledDate} onChange={e => handleChange('scheduledDate', e.target.value)} required />
                                <Input label="Lugar / Enlace de Videollamada" value={formData.location} onChange={e => handleChange('location', e.target.value)} required />
                                <Select label="Entrevistadores" value={formData.interviewers} onChange={e => handleChange('interviewers', Array.from(e.target.selectedOptions, option => option.value))} multiple required>
                                    {companyInvestigators.map(inv => <option key={inv.uid} value={inv.uid}>{inv.name}</option>)}
                                </Select>
                                <Select label="Estado" value={formData.status} onChange={e => handleChange('status', e.target.value)}>
                                    <option>Programada</option><option>Completada</option><option>Cancelada</option>
                                </Select>
                                {formData.status === 'Completada' && (
                                    <TextArea label="Resumen / Notas de la Entrevista" value={formData.summary} onChange={e => handleChange('summary', e.target.value)} rows={5} />
                                )}
                            </>
                        ) : (
                            <div className="text-center p-4">
                                <h3 className="text-lg font-semibold text-emerald-600">¡Entrevista Guardada!</h3>
                                <p className="text-slate-600 my-2">Ahora puedes añadir el evento a tu calendario.</p>
                                <Button onClick={() => generateICSFile(lastSavedInterview)}>
                                    <Download className="w-4 h-4"/> Descargar Archivo .ics
                                </Button>
