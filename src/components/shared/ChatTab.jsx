// src/components/shared/ChatTab.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Card, Input, Button, Modal } from '../common';
import { Send, MessageSquarePlus } from 'lucide-react';

const ChatTab = ({ title, messages, onSendMessage, currentUserId, placeholder, currentUserColor, otherUserColor, complaintId }) => {
    const { user, allUsers } = useAuth();
    const { communicationTemplates } = useData();
    const [newComment, setNewComment] = useState("");
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const messagesEndRef = useRef(null);

    const companyTemplates = communicationTemplates[user.companyId] || [];

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [messages]);
    
    const handleAddComment = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        onSendMessage(newComment);
        setNewComment("");
    };
    
    const getUser = (senderId) => {
        if(senderId === 'complainant') return { name: 'Denunciante', uid: 'complainant' };
        return allUsers.find(u => u.uid === senderId) || { name: 'Usuario Desconocido' };
    };

    const handleSelectTemplate = (template) => {
        // Reemplaza placeholders como [CODIGO_CASO] con el valor real
        const processedContent = template.content.replace(/\[CODIGO_CASO\]/g, complaintId || '');
        setNewComment(processedContent);
        setIsTemplateModalOpen(false);
    };

    const canSend = title.includes("Denunciante") ? user.permissions.comunicacion_denunciante_puede_enviar : user.permissions.comentarios_internos_puede_enviar;

    return (
        <Card>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 mb-4 bg-slate-50 p-4 rounded-lg">
                {(messages || []).map(comment => {
                    const author = getUser(comment.senderId);
                    const isCurrentUser = author?.uid === currentUserId;
                    return (
                        <div key={comment.id} className={`flex items-start gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                             <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-bold flex-shrink-0">{author?.name[0] || '?'}</div>
                            <div className={`p-3 rounded-lg max-w-lg ${isCurrentUser ? currentUserColor : otherUserColor}`}>
                                <p className="text-sm text-slate-800 whitespace-pre-wrap">{comment.text}</p>
                                <p className={`text-xs text-slate-500 mt-1 ${isCurrentUser ? 'text-right' : ''}`}>{author?.name} - {new Date(comment.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>
            {canSend && (
                <form onSubmit={handleAddComment} className="flex items-center gap-2 border-t pt-4">
                    <Input id="new-message" placeholder={placeholder} value={newComment} onChange={e => setNewComment(e.target.value)} className="flex-1"/>
                    {companyTemplates.length > 0 && (
                        <Button type="button" variant="secondary" onClick={() => setIsTemplateModalOpen(true)} title="Usar Plantilla">
                            <MessageSquarePlus className="w-5 h-5"/>
                        </Button>
                    )}
                    <Button type="submit" variant="primary" className="p-2.5">
                        <Send className="w-5 h-5"/>
                    </Button>
                </form>
            )}
            <Modal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} title="Seleccionar Plantilla">
                <div className="space-y-2">
                    {companyTemplates.map(template => (
                        <button key={template.id} onClick={() => handleSelectTemplate(template)} className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-md">
                            <p className="font-semibold">{template.name}</p>
                            <p className="text-xs text-slate-500 truncate">{template.content}</p>
                        </button>
                    ))}
                </div>
            </Modal>
        </Card>
    );
};

export default ChatTab;
