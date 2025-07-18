// src/components/shared/ChatTab.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Card, TextArea, Button, Modal } from '../common';
import { Send, MessageSquarePlus, Reply, X } from 'lucide-react';

const ChatTab = ({ title, messages, onSendMessage, currentUserId, placeholder, currentUserColor, otherUserColor, complaintId }) => {
    const { user, allUsers } = useAuth();
    const { communicationTemplates } = useData();
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const textAreaRef = useRef(null);

    const companyTemplates = user ? (communicationTemplates[user.companyId] || []) : [];

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        if (replyingTo) {
            textAreaRef.current?.focus();
        }
    }, [replyingTo]);

    const handleAddComment = (e) => {
        if (e) e.preventDefault();
        if (!newComment.trim()) return;

        const baseSender = user || { uid: currentUserId };

        const newMessage = {
            id: uuidv4(),
            text: newComment,
            senderId: baseSender.uid,
            senderName: `${baseSender.firstName || 'Denunciante'} ${baseSender.lastName || ''}`.trim(),
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
        setReplyingTo(null);
    };
    
    const getUserFullName = (userObject) => {
        if (!userObject) return "Usuario Desconocido";
        if (userObject.uid === 'complainant') return 'Denunciante';
        return `${userObject.firstName || ''} ${userObject.lastName || ''}`.trim();
    };

    const getUser = (senderId) => {
        if (senderId === 'complainant') return { firstName: 'Denunciante', lastName: '', uid: 'complainant' };
        const foundUser = allUsers.find(u => u.uid === senderId);
        if (foundUser) return foundUser;
        
        // Check if it's an accused person ID
        if (complaintId) {
             const complaint = useData().complaints.find(c => c.id === complaintId);
             if (complaint && complaint.originalData && complaint.originalData.accusedPersons) {
                 const accused = complaint.originalData.accusedPersons.find(p => p.id === senderId);
                 if (accused) return { firstName: accused.name, lastName: '(Denunciado)', uid: accused.id };
             }
        }
        return { firstName: 'Usuario', lastName: 'Desconocido' };
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

    const isInteractive = typeof onSendMessage === 'function';

    return (
        <Card>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
            <div className="space-y-1 max-h-96 overflow-y-auto pr-2 mb-4 bg-slate-50 p-4 rounded-lg">
                {(messages || []).map(comment => {
                    const author = getUser(comment.senderId);
                    const isCurrentUser = author?.uid === currentUserId;
                    const authorFullName = getUserFullName(author);
                    return (
                        <div key={comment.id} className={`flex items-start gap-3 group ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                             <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-bold flex-shrink-0">
                                {author?.firstName?.[0] || '?'}
                             </div>
                            <div className={`relative p-3 rounded-lg max-w-lg ${isCurrentUser ? currentUserColor : otherUserColor}`}>
                                {comment.replyTo && (
                                    <div className="mb-2 p-2 border-l-2 border-slate-400 bg-black/5 rounded-md">
                                        <p className="font-semibold text-xs text-slate-600">{comment.replyTo.senderName}</p>
                                        <p className="text-xs text-slate-500 truncate">{comment.replyTo.text}</p>
                                    </div>
                                )}
                                <p className="text-sm text-slate-800 whitespace-pre-wrap">{comment.text}</p>
                                <p className={`text-xs text-slate-500 mt-1 ${isCurrentUser ? 'text-right' : ''}`}>{authorFullName} - {new Date(comment.timestamp).toLocaleString()}</p>
                            </div>
                            <div className={`opacity-0 group-hover:opacity-100 transition-opacity self-center ${isCurrentUser ? 'mr-2' : 'ml-2'}`}>
                                <Button variant="ghost" className="p-1 h-auto" onClick={() => setReplyingTo({ ...comment, senderName: authorFullName })} title="Responder">
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
            {user && ( <Modal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} title="Seleccionar Plantilla">
                <div className="space-y-2">
                    {companyTemplates.map(template => (
                        <button key={template.id} onClick={() => handleSelectTemplate(template)} className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-md">
                            <p className="font-semibold">{template.name}</p>
                            <p className="text-xs text-slate-500 truncate">{template.content}</p>
                        </button>
                    ))}
                </div>
            </Modal> )}
        </Card>
    );
};

export default ChatTab;
