// src/pages/admin/case-details/CommunicationsTab.jsx
import React from 'react';
import ChatTab from '../../../components/shared/ChatTab';
import { useAuth } from '../../../contexts/AuthContext';
import { userHasPermission } from '../../../utils/userUtils';
import Accordion from '../../../components/common/Accordion'; // Importar el nuevo componente
import { MessageSquare, UserCheck, MessageCircle } from 'lucide-react';

const CommunicationsTab = ({ 
    complaint, 
    onSendPublicMessage, 
    onSendAccusedMessage, 
    onSendInternalComment 
}) => {
    const { user } = useAuth();

    return (
        <div className="space-y-4">
            {userHasPermission(user, 'comunicacion_denunciante_puede_ver') && (
                <Accordion
                    title="Comunicaciones con Denunciante"
                    titleIcon={<MessageCircle className="w-5 h-5 text-white"/>}
                    headerClassName="bg-blue-600"
                    defaultOpen={true}
                >
                    <ChatTab 
                        messages={complaint.chatMessages || []}
                        onSendMessage={onSendPublicMessage}
                        currentUserId={user.uid}
                        placeholder="Escribe un mensaje para el denunciante..."
                        currentUserColor="bg-indigo-100"
                        otherUserColor="bg-slate-200"
                        complaintId={complaint.id}
                    />
                </Accordion>
            )}
            
            {userHasPermission(user, 'comunicacion_denunciante_puede_ver') && (
                <Accordion
                    title="Comunicaciones con Denunciado(s)"
                    titleIcon={<UserCheck className="w-5 h-5 text-white"/>}
                    headerClassName="bg-emerald-600"
                >
                     <ChatTab 
                        messages={complaint.accusedChatMessages || []}
                        onSendMessage={onSendAccusedMessage}
                        currentUserId={user.uid}
                        placeholder="Escribe un mensaje para el/los denunciado(s)..."
                        currentUserColor="bg-indigo-100"
                        otherUserColor="bg-slate-200"
                        complaintId={complaint.id}
                    />
                </Accordion>
            )}

            {userHasPermission(user, 'comentarios_internos_puede_ver') && (
                <Accordion
                    title="Comentarios Internos"
                    titleIcon={<MessageSquare className="w-5 h-5 text-black"/>}
                    headerClassName="bg-amber-400"
                >
                    <ChatTab 
                        messages={complaint.internalComments || []}
                        onSendMessage={onSendInternalComment}
                        currentUserId={user.uid}
                        placeholder="Escribe un comentario interno..."
                        currentUserColor="bg-amber-100"
                        otherUserColor="bg-slate-200"
                    />
                </Accordion>
            )}
        </div>
    );
};

export default CommunicationsTab;
