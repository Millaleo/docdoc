import { useEffect, useState } from 'react';
import { api } from '../api/client';

export const DocumentsPage = () => {
  const [docs, setDocs] = useState<any[]>([]);
  const [title, setTitle] = useState('Documento familiar');
  const familyId = localStorage.getItem('familyId') || '';
  const load = () => familyId && api(`/documents/${familyId}`).then(setDocs).catch(()=>setDocs([]));
  useEffect(load, []);
  const create = async () => {
    await api('/documents', { method: 'POST', body: JSON.stringify({ familyId, category: 'OTHER', title, filePath: '/uploads/example.pdf' }) });
    load();
  };
  return <div><h3>/documents</h3><input value={title} onChange={(e)=>setTitle(e.target.value)} /><button onClick={create}>Subir metadata</button><ul>{docs.map((d)=> <li key={d.id}>{d.title} - {d.category}</li>)}</ul></div>;
};
