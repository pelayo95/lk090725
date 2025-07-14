// src/pages/admin/case-details/CommunicationsTab.jsx
import React from 'react';
import ChatTab from '../../../components/shared/ChatTab';
import { useAuth } from '../../../contexts/AuthContext';
import { userHasPermission } from '../../../utils/userUtils';

const CommunicationsTab = ({ 
    complaint, 
    onSendPublicMessage, 
    onSendAccusedMessage, 
    onSendInternalComment 
}) => {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            {userHasPermission(user, 'comunicacion_denunciante_puede_ver') && (
                <ChatTab 
                    title="Comunicaciones con Denunciante"
                    messages={complaint.chatMessages || []}
                    onSendMessage={onSendPublicMessage}
                    currentUserId={user.uid}
                    placeholder="Escribe un mensaje para el denunciante..."
                    currentUserColor="bg-indigo-100"
                    otherUserColor="bg-slate-200"
                    complaintId={complaint.id}
                />
            )}
            
            {userHasPermission(user, 'comunicacion_denunciante_puede_ver') && (
                 <ChatTab 
                    title="Comunicaciones con Denunciado(s)"
                    messages={complaint.accusedChatMessages || []}
                    onSendMessage={onSendAccusedMessage}
                    currentUserId={user.uid}
                    placeholder="Escribe un mensaje para el/los denunciado(s)..."
                    currentUserColor="bg-indigo-100"
                    otherUserColor="bg-slate-200"
                    complaintId={complaint.id}
                />
            )}

            {userHasPermission(user, 'comentarios_internos_puede_ver') && (
                <ChatTab 
                    title="Comentarios Internos"
                    messages={complaint.internalComments || []}
                    onSendMessage={onSendInternalComment}
                    currentUserId={user.uid}
                    placeholder="Escribe un comentario interno..."
                    currentUserColor="bg-amber-100"
                    otherUserColor="bg-slate-200"
                />
            )}
        </div>
    );
};

export default CommunicationsTab;
