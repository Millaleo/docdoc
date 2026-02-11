import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { Login } from './pages/Login';
import { Inbox } from './pages/Inbox';
import { Tickets } from './pages/Tickets';
import { Families } from './pages/Families';
import { Plans } from './pages/Plans';
import { Audit } from './pages/Audit';

const App = () => <BrowserRouter><div style={{ fontFamily: 'sans-serif', padding: 12 }}><h2>DocDoc Admin</h2><nav style={{display:'flex',gap:8}}><Link to='/login'>Login</Link><Link to='/inbox'>Inbox</Link><Link to='/tickets'>Tickets</Link><Link to='/families'>Families</Link><Link to='/plans'>Plans</Link><Link to='/audit'>Audit</Link></nav><Routes><Route path='/login' element={<Login/>}/><Route path='/inbox' element={<Inbox/>}/><Route path='/tickets' element={<Tickets/>}/><Route path='/families' element={<Families/>}/><Route path='/plans' element={<Plans/>}/><Route path='/audit' element={<Audit/>}/><Route path='*' element={<Login/>}/></Routes></div></BrowserRouter>;
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
