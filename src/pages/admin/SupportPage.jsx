// src/pages/admin/SupportPage.jsx
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Card, Button, Input, TextArea, Modal } from '../../components/common';
import { AddItemModal } from '../../components/common/AddItemModal';
import { Plus } from 'lucide-react';
import ChatTab from '../../components/shared/ChatTab';
import { uuidv4 } from '../../utils/uuid';

const SupportPage = () => {
    const { user } = useAuth();
    const { supportTickets, addSupportTicket, updateSupportTicket } = useData();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [viewingTicket, setViewingTicket] = useState(null);

    const companyTickets = useMemo(() => 
        (supportTickets || []).filter(t => t.companyId === user.companyId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [supportTickets, user.companyId]);

    const handleCreateTicket = (formData) => {
        const ticketData = {
            subject: formData.subject,
            messages: [{
                id: uuidv4(),
                text: formData.message,
                senderId: user.uid,
                senderName: user.name,
                timestamp: new Date().toISOString(),
            }]
        };
        addSupportTicket(ticketData, user);
        setIsCreateModalOpen(false);
    };

    const handleSendMessage = (text) => {
        if (!viewingTicket) return;
        const newMessage = {
            id: uuidv4(),
            text,
            senderId: user.uid,
            senderName: user.name,
            timestamp: new Date().toISOString(),
        };
        const updatedTicket = {
            ...viewingTicket,
            messages: [...viewingTicket.messages, newMessage],
            status: 'En progreso'
        };
        updateSupportTicket(viewingTicket.id, updatedTicket);
        setViewingTicket(updatedTicket);
    };

    const statusColors = {
        'Abierto': 'bg-blue-100 text-blue-800',
        'En progreso': 'bg-yellow-100 text-yellow-800',
        'Cerrado': 'bg-green-100 text-green-800',
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Tickets de Soporte</h1>
                <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
                    <Plus className="w-4 h-4"/> Crear Ticket
                </Button>
            </div>
            <Card className="p-0">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">ID Ticket</th>
                            <th scope="col" className="px-6 py-3">Asunto</th>
                            <th scope="col" className="px-6 py-3">Fecha Creación</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companyTickets.map(ticket => (
                            <tr key={ticket.id} className="bg-white border-b hover:bg-slate-50 cursor-pointer" onClick={() => setViewingTicket(ticket)}>
                                <td className="px-6 py-4 font-medium">{ticket.id}</td>
                                <td className="px-6 py-4">{ticket.subject}</td>
                                <td className="px-6 py-4">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[ticket.status] || 'bg-slate-100'}`}>
                                        {ticket.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <AddItemModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateTicket}
                title="Crear Nuevo Ticket de Soporte"
                initialState={{ subject: '', message: '' }}
            >
                {(formData, handleChange) => (
                    <>
                        <Input label="Asunto" value={formData.subject} onChange={e => handleChange('subject', e.target.value)} required />
                        <TextArea label="Describa su problema o consulta" value={formData.message} onChange={e => handleChange('message', e.target.value)} required rows={6} />
                    </>
                )}
            </AddItemModal>

            {viewingTicket && (
                <Modal isOpen={!!viewingTicket} onClose={() => setViewingTicket(null)} title={`Ticket: ${viewingTicket.id} - ${viewingTicket.subject}`}>
                    <ChatTab
                        title="Conversación de Soporte"
                        messages={viewingTicket.messages}
                        onSendMessage={handleSendMessage}
                        currentUserId={user.uid}
                        placeholder="Escribe tu respuesta..."
                        currentUserColor="bg-sky-100"
                        otherUserColor="bg-slate-200"
                    />
                </Modal>
            )}
        </div>
    );
};

export default SupportPage;
