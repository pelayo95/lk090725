// src/components/shared/ChatTab.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Input, Button } from '../common';
import { Send } from 'lucide-react';

const ChatTab = ({ title, messages, onSendMessage, currentUserId, placeholder, currentUserColor, otherUserColor }) => {
    const { allUsers } = useAuth();
    const [newComment, setNewComment] = useState("");
    const messagesEndRef = useRef(null);

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
                                <p className="text-sm text-slate-800">{comment.text}</p>
                                <p className={`text-xs text-slate-500 mt-1 ${isCurrentUser ? 'text-right' : ''}`}>{author?.name} - {new Date(comment.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleAddComment} className="flex items-center gap-2 border-t pt-4">
                <Input id="new-message" placeholder={placeholder} value={newComment} onChange={e => setNewComment(e.target.value)} className="flex-1"/>
                <Button type="submit" variant="primary" className="p-2.5">
                    <Send className="w-5 h-5"/>
                </Button>
            </form>
        </Card>
    );
};

export default ChatTab;
