// src/components/shared/ChatTab.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Card, TextArea, Button, Modal } from '../common';
import { Send, MessageSquarePlus, Reply, X } from 'lucide-react'; // Íconos añadidos

const ChatTab = ({ title, messages, onSendMessage, currentUserId, placeholder, currentUserColor, otherUserColor, complaintId }) => {
    const { user, allUsers } = useAuth();
    const { communicationTemplates } = useData();
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState(null); // Estado para el mensaje que se está respondiendo
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const textAreaRef = useRef(null);

    const companyTemplates = user ? (communicationTemplates[user.companyId] || []) : [];

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [messages]);
    
    // Enfocar el área de texto cuando se selecciona un mensaje para responder
    useEffect(() => {
        if (replyingTo) {
            textAreaRef.current?.focus();
        }
    }, [replyingTo]);

    const handleAddComment = (e) => {
        if (e) e.preventDefault();
        if (!newComment.trim()) return;

        const newMessage = {
            id: uuidv4(),
            text: newComment,
            senderId: user?.uid || 'complainant', // Asume 'complainant' si no hay admin
            senderName: user?.name || 'Denunciante',
            timestamp: new Date().toISOString(),
        };

        if (replyingTo) {
            newMessage.replyTo = {
                id: replyingTo.id,
                senderName: replyingTo.senderName,
                text: replyingTo.text
            };
        }

        onSendMessage(newMessage);
        setNewComment("");
        setReplyingTo(null); // Limpiar el estado de respuesta
    };
    
    const getUser = (senderId) => {
        if (senderId === 'complainant') return { name: 'Denunciante', uid: 'complainant' };
        if (senderId === 'accused') return { name: 'Denunciado', uid: 'accused' }; // Puede necesitar más detalles
        return allUsers.find(u => u.uid === senderId) || { name: 'Usuario Desconocido' };
    };

    const handleSelectTemplate = (template) => { /* ... */ };
    const handleKeyDown = (e) => { /* ... */ };
    const isInteractive = typeof onSendMessage === 'function';

    return (
        <Card>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
            <div className="space-y-1 max-h-96 overflow-y-auto pr-2 mb-4 bg-slate-50 p-4 rounded-lg">
                {(messages || []).map(comment => {
                    const author = getUser(comment.senderId);
                    const isCurrentUser = author?.uid === currentUserId;
                    return (
                        <div key={comment.id} className={`flex items-start gap-3 group ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                             <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-bold flex-shrink-0">{author?.name[0] || '?'}</div>
                            <div className={`relative p-3 rounded-lg max-w-lg ${isCurrentUser ? currentUserColor : otherUserColor}`}>
                                {/* --- Renderizado de la Cita de Respuesta --- */}
                                {comment.replyTo && (
                                    <div className="mb-2 p-2 border-l-2 border-slate-400 bg-black/5 rounded-md">
                                        <p className="font-semibold text-xs text-slate-600">{comment.replyTo.senderName}</p>
                                        <p className="text-xs text-slate-500 truncate">{comment.replyTo.text}</p>
                                    </div>
                                )}
                                <p className="text-sm text-slate-800 whitespace-pre-wrap">{comment.text}</p>
                                <p className={`text-xs text-slate-500 mt-1 ${isCurrentUser ? 'text-right' : ''}`}>{author?.name} - {new Date(comment.timestamp).toLocaleString()}</p>
                            </div>
                             {/* --- Botón para Responder --- */}
                            <div className={`opacity-0 group-hover:opacity-100 transition-opacity self-center ${isCurrentUser ? 'mr-2' : 'ml-2'}`}>
                                <Button variant="ghost" className="p-1 h-auto" onClick={() => setReplyingTo(comment)} title="Responder">
                                    <Reply className="w-4 h-4 text-slate-500"/>
                                </Button>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>
            
            {isInteractive && (
                <div className="border-t pt-4">
                     {/* --- Vista Previa de la Respuesta --- */}
                    {replyingTo && (
                        <div className="flex justify-between items-center p-2 mb-2 bg-slate-100 rounded-md border border-slate-300">
                             <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-semibold text-slate-600">Respondiendo a {replyingTo.senderName}</p>
                                <p className="text-xs text-slate-500 truncate">{replyingTo.text}</p>
                            </div>
                             <Button variant="ghost" className="p-1 h-auto" onClick={() => setReplyingTo(null)}>
                                <X className="w-4 h-4 text-slate-500"/>
                            </Button>
                        </div>
                    )}
                    <form onSubmit={handleAddComment} className="flex items-start gap-2">
                        <TextArea 
                            ref={textAreaRef}
                            id="new-message" 
                            placeholder={placeholder} 
                            value={newComment} 
                            onChange={e => setNewComment(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 resize-none"
                            rows="3"
                        />
                        <div className="flex flex-col gap-2">
                            {user && companyTemplates.length > 0 && (
                                <Button type="button" variant="secondary" onClick={() => setIsTemplateModalOpen(true)} title="Usar Plantilla">
                                    <MessageSquarePlus className="w-5 h-5"/>
                                </Button>
                            )}
                            <Button type="submit" variant="primary" className="p-2.5">
                                <Send className="w-5 h-5"/>
                            </Button>
                        </div>
                    </form>
                </div>
            )}
            {user && ( <Modal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} title="Seleccionar Plantilla"> {/* ... */} </Modal> )}
        </Card>
    );
};

export default ChatTab;
