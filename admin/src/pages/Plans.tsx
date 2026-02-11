import { useEffect, useState } from 'react';
import { api } from '../api';

export const Plans = () => {
  const [plans, setPlans] = useState<any[]>([]);
  useEffect(() => { api('/admin/plans').then(setPlans).catch(()=>setPlans([])); }, []);
  return <div><h3>/plans</h3><ul>{plans.map(p=> <li key={p.id}>{p.name} ({p.benefits?.length ?? 0} beneficios)</li>)}</ul></div>;
};
