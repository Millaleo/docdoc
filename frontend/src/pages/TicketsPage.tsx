import { useEffect, useState } from 'react';
import { api } from '../api/client';

export const TicketsPage = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [title, setTitle] = useState('Solicitud administrativa');
  const load = () => api('/tickets').then(setTickets).catch(() => setTickets([]));
  useEffect(load, []);
  const create = async () => {
    const familyId = localStorage.getItem('familyId');
    await api('/tickets', { method: 'POST', body: JSON.stringify({ familyId, type: 'ADMIN', title, description: 'MVP request' }) });
    load();
  };
  return <div><h3>/tickets</h3><input value={title} onChange={(e)=>setTitle(e.target.value)} /><button onClick={create}>Crear ticket</button><ul>{tickets.map((t)=> <li key={t.id}>{t.title} - {t.status}</li>)}</ul></div>;
};
