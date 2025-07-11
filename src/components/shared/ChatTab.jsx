// src/components/shared/ChatTab.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Card, TextArea, Button, Modal } from '../common';
import { Send, MessageSquarePlus } from 'lucide-react';

const ChatTab = ({ title, messages, onSendMessage, currentUserId, placeholder, currentUserColor, otherUserColor, complaintId }) => {
    const { user, allUsers } = useAuth();
    const { communicationTemplates } = useData();
    const [newComment, setNewComment] = useState("");
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const messagesEndRef = useRef(null);

    // --- INICIO DE LA CORRECCIÓN ---
    // Se obtienen las plantillas de forma segura, solo si existe un usuario logueado.
    const companyTemplates = user ? (communicationTemplates[user.companyId] || []) : [];

    // Se determina si el chat debe ser interactivo (permitir enviar mensajes).
    // Esto es verdad si se proporciona la función `onSendMessage`.
    const isInteractive = typeof onSendMessage === 'function';
    // --- FIN DE LA CORRECCIÓN ---

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [messages]);
    
    const handleAddComment = (e) => {
        if (e) e.preventDefault();
        if (!newComment.trim()) return;
        onSendMessage(newComment);
        setNewComment("");
    };
    
    const getUser = (senderId) => {
        if(senderId === 'complainant') return { name: 'Denunciante', uid: 'complainant' };
        return allUsers.find(u => u.uid === senderId) || { name: 'Usuario Desconocido' };
    };

    const handleSelectTemplate = (template) => {
        const processedContent = template.content.replace(/\[CODIGO_CASO\]/g, complaintId || '');
        setNewComment(processedContent);
        setIsTemplateModalOpen(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddComment();
        }
    };

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
            
            {/* Se renderiza el formulario de envío si el chat es interactivo */}
            {isInteractive && (
                <form onSubmit={handleAddComment} className="flex items-start gap-2 border-t pt-4">
                    <TextArea 
                        id="new-message" 
                        placeholder={placeholder} 
                        value={newComment} 
                        onChange={e => setNewComment(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 resize-none"
                        rows="3"
                    />
                    <div className="flex flex-col gap-2">
                        {/* El botón de plantillas solo aparece si es un admin */}
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
            )}

            {/* El modal de plantillas solo se necesita si es un admin */}
            {user && (
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
            )}
        </Card>
    );
};

export default ChatTab;
