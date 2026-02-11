import { useEffect, useState } from 'react';
import { api } from '../api';

export const Inbox = () => {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api('/chat/conversations').then(setRows).catch(()=>setRows([])); }, []);
  return <div><h3>/inbox</h3><ul>{rows.map(r=> <li key={r.id}>{r.subject ?? 'Sin asunto'} | tag:{r.tag ?? '-'} | assigned:{r.assignedStaffId ?? '-'}</li>)}</ul></div>;
};
