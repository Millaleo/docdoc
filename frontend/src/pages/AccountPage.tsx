import { useEffect, useState } from 'react';
import { api } from '../api/client';

export const AccountPage = () => {
  const [email, setEmail] = useState('');
  useEffect(() => { api('/auth/me').then((d) => setEmail(d.user.email)).catch(() => setEmail('no-auth')); }, []);
  return <div><h3>/account</h3><p>{email}</p></div>;
};
