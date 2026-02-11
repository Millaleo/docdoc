import { useState } from 'react';
import { api } from '../api/client';

export const OnboardingPage = () => {
  const [familyId, setFamilyId] = useState('');
  const create = async () => {
    const result = await api('/family/create', { method: 'POST', body: JSON.stringify({}) });
    setFamilyId(result.id);
    localStorage.setItem('familyId', result.id);
  };
  return <div><h3>/onboarding</h3><button onClick={create}>Crear familia titular</button><p>{familyId}</p></div>;
};
