import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { FamilyPage } from './pages/FamilyPage';
import { ChatPage } from './pages/ChatPage';
import { TicketsPage } from './pages/TicketsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { AccountPage } from './pages/AccountPage';

const Nav = () => (
  <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
    <Link to="/home">Home</Link>
    <Link to="/family">Family</Link>
    <Link to="/chat">Chat</Link>
    <Link to="/tickets">Tickets</Link>
    <Link to="/documents">Documents</Link>
    <Link to="/account">Account</Link>
  </nav>
);

const App = () => (
  <BrowserRouter>
    <div style={{ maxWidth: 460, margin: '0 auto', padding: 12, fontFamily: 'sans-serif' }}>
      <h2>DocDoc Contigo</h2>
      <Nav />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/family" element={<FamilyPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
