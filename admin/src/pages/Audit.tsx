import { useEffect, useState } from 'react';
import { api } from '../api';

export const Audit = () => {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => { api('/admin/audit').then(setLogs).catch(()=>setLogs([])); }, []);
  return <div><h3>/audit</h3><ul>{logs.map(l=> <li key={l.id}>{l.action} - {l.resourceType}</li>)}</ul></div>;
};
