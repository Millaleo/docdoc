import { useEffect, useState } from 'react';
import { api } from '../api/client';

export const HomePage = () => {
  const [status, setStatus] = useState('');
  useEffect(() => {
    const familyId = localStorage.getItem('familyId');
    if (familyId) api(`/subscription/${familyId}`).then((s) => setStatus(`${s?.status ?? 'N/A'} - ${s?.plan?.name ?? ''}`)).catch(() => setStatus('Sin suscripción'));
  }, []);
  return <div><h3>/home</h3><p>Plan: {status}</p></div>;
};
