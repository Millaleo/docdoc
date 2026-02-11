import { useState } from 'react';
import { api } from '../api/client';

export const ChatPage = () => {
  const [conversationId, setConversationId] = useState('');
  const [text, setText] = useState('Hola equipo DocDoc');
  const [out, setOut] = useState('');
  const createConversation = async () => {
    const familyId = localStorage.getItem('familyId');
    const c = await api('/chat/conversations', { method: 'POST', body: JSON.stringify({ familyId, subject: 'Consulta general' }) });
    setConversationId(c.id);
  };
  const send = async () => {
    const m = await api(`/chat/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify({ text }) });
    setOut(`Mensaje enviado ${m.id}`);
  };
  return <div><h3>/chat</h3><button onClick={createConversation}>Nueva conversación</button><input value={conversationId} onChange={(e)=>setConversationId(e.target.value)} placeholder='Conversation ID' /><input value={text} onChange={(e)=>setText(e.target.value)} /><button onClick={send}>Enviar</button><p>{out}</p></div>;
};
