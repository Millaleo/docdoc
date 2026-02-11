import { useState } from 'react';
import { api } from '../api';

export const Login = () => {
  const [email, setEmail] = useState('admin@docdoccontigo.cl');
  const [password, setPassword] = useState('Admin1234!');
  const [msg, setMsg] = useState('');
  const login = async () => {
    try {
      const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      localStorage.setItem('adminToken', data.accessToken);
      setMsg('OK');
    } catch {
      setMsg('Error');
    }
  };
  return <div><h3>/login</h3><input value={email} onChange={(e)=>setEmail(e.target.value)} /><input value={password} type='password' onChange={(e)=>setPassword(e.target.value)} /><button onClick={login}>Entrar</button><p>{msg}</p></div>;
};
