// src/pages/boss/BossSupportPage.jsx
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Card, Button, Modal, Select } from '../../components/common';
import ChatTab from '../../components/shared/ChatTab';
import { uuidv4 } from '../../utils/uuid';

const BossSupportPage = () => {
    const { user } = useAuth();
    const { supportTickets, updateSupportTicket, companies } = useData();
    const [viewingTicket, setViewingTicket] = useState(null);
    const [filterCompany, setFilterCompany] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredTickets = useMemo(() => {
        return (supportTickets || [])
            .filter(t => filterCompany === 'all' || t.companyId === filterCompany)
            .filter(t => filterStatus === 'all' || t.status === filterStatus)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [supportTickets, filterCompany, filterStatus]);

    const handleSendMessage = (text) => {
        if (!viewingTicket) return;
        const newMessage = {
            id: uuidv4(),
            text,
            senderId: user.uid,
            senderName: "Soporte (Boss)",
            timestamp: new Date().toISOString(),
        };
        const updatedTicket = {
            ...viewingTicket,
            messages: [...viewingTicket.messages, newMessage],
        };
        updateSupportTicket(viewingTicket.id, updatedTicket);
        setViewingTicket(updatedTicket);
    };

    const handleStatusChange = (newStatus) => {
        if (!viewingTicket) return;
        const updatedTicket = { ...viewingTicket, status: newStatus };
        updateSupportTicket(viewingTicket.id, updatedTicket);
        setViewingTicket(updatedTicket);
    };

    const getCompanyName = (companyId) => {
        return companies.find(c => c.id === companyId)?.name || 'N/A';
    };

    const statusColors = {
        'Abierto': 'bg-blue-100 text-blue-800',
        'En progreso': 'bg-yellow-100 text-yellow-800',
        'Cerrado': 'bg-green-100 text-green-800',
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Panel de Soporte Global</h1>
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Filtrar por Empresa" value={filterCompany} onChange={e => setFilterCompany(e.target.value)}>
                        <option value="all">Todas las Empresas</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>
                    <Select label="Filtrar por Estado" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="all">Todos los Estados</option>
                        <option value="Abierto">Abierto</option>
                        <option value="En progreso">En progreso</option>
                        <option value="Cerrado">Cerrado</option>
                    </Select>
                </div>
            </Card>
            <Card className="p-0">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">ID Ticket</th>
                            <th scope="col" className="px-6 py-3">Empresa</th>
                            <th scope="col" className="px-6 py-3">Asunto</th>
                            <th scope="col" className="px-6 py-3">Fecha</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTickets.map(ticket => (
                            <tr key={ticket.id} className="bg-white border-b hover:bg-slate-50 cursor-pointer" onClick={() => setViewingTicket(ticket)}>
                                <td className="px-6 py-4 font-medium">{ticket.id}</td>
                                <td className="px-6 py-4">{getCompanyName(ticket.companyId)}</td>
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

            {viewingTicket && (
                <Modal isOpen={!!viewingTicket} onClose={() => setViewingTicket(null)} title={`Ticket: ${viewingTicket.id} - ${getCompanyName(viewingTicket.companyId)}`}>
                    <div className="mb-4 p-4 bg-slate-100 rounded-md">
                        <h4 className="font-semibold">{viewingTicket.subject}</h4>
                        <div className="flex items-center gap-4 mt-2">
                            <label className="text-sm font-medium">Estado:</label>
                            <Select value={viewingTicket.status} onChange={e => handleStatusChange(e.target.value)}>
                                <option value="Abierto">Abierto</option>
                                <option value="En progreso">En progreso</option>
                                <option value="Cerrado">Cerrado</option>
                            </Select>
                        </div>
                    </div>
                    <ChatTab
                        title="Conversación de Soporte"
                        messages={viewingTicket.messages}
                        onSendMessage={handleSendMessage}
                        currentUserId={user.uid}
                        placeholder="Escribe tu respuesta..."
                        currentUserColor="bg-amber-100"
                        otherUserColor="bg-slate-200"
                    />
                </Modal>
            )}
        </div>
    );
};

export default BossSupportPage;
