import { useState } from 'react';
import { api } from '../api/client';

export const LoginPage = () => {
  const [email, setEmail] = useState('admin@docdoccontigo.cl');
  const [password, setPassword] = useState('Admin1234!');
  const [message, setMessage] = useState('');

  const onLogin = async () => {
    try {
      const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      localStorage.setItem('accessToken', data.accessToken);
      setMessage('Login correcto');
    } catch {
      setMessage('Error de login');
    }
  };

  return <div><h3>/login</h3><input value={email} onChange={(e) => setEmail(e.target.value)} /><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" /><button onClick={onLogin}>Entrar</button><p>{message}</p></div>;
};
