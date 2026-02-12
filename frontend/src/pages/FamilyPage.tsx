import { useState } from 'react';
import { api } from '../api/client';

export const FamilyPage = () => {
  const [name, setName] = useState('');
  const [resp, setResp] = useState('');
  const add = async () => {
    const familyId = localStorage.getItem('familyId');
    const r = await api(`/family/${familyId}/members`, { method: 'POST', body: JSON.stringify({ displayName: name, type: 'ACTIVE' }) });
    setResp(`Miembro ${r.displayName} creado`);
  };
  return <div><h3>/family</h3><input placeholder='Nombre miembro' value={name} onChange={(e)=>setName(e.target.value)} /><button onClick={add}>Agregar</button><p>{resp}</p></div>;
};
