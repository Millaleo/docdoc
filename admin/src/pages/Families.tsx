import { useEffect, useState } from 'react';
import { api } from '../api';

export const Families = () => {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api('/admin/families').then(setRows).catch(()=>setRows([])); }, []);
  return <div><h3>/families</h3><ul>{rows.map(r=> <li key={r.id}>{r.id} - {r.holder?.email}</li>)}</ul></div>;
};
