import { useEffect, useState } from 'react';
import { api } from '../api/client';

export const HomePage = () => {
  const [summary, setSummary] = useState('');

  useEffect(() => {
    api('/family')
      .then((families) => {
        const first = families?.[0];
        if (!first) return setSummary('No family found, create one from API first.');
        localStorage.setItem('familyId', first.id);
        setSummary(`Family ${first.id} | Status: ${first.status}`);
      })
      .catch(() => setSummary('Unable to load family summary.'));
  }, []);

  return (
    <div>
      <h3>/home</h3>
      <p>{summary}</p>
    </div>
  );
};
