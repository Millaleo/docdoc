import { useEffect, useState } from 'react';
import { api } from '../api';

export const Tickets = () => {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api('/tickets').then(setRows).catch(()=>setRows([])); }, []);
  return <div><h3>/tickets</h3><ul>{rows.map(r=> <li key={r.id}>{r.title} - {r.status}</li>)}</ul></div>;
};
