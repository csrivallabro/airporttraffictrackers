import { useState } from 'react';
import Home from './pages/Home';
import Results from './pages/Results';
import type { EstimateResponse } from './lib/api';

export default function App() {
  const [data, setData] = useState<EstimateResponse | null>(null);
  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: 16, fontFamily: 'ui-sans-serif' }}>
      {!data ? <Home onResult={setData} /> : <Results data={data} onReset={() => setData(null)} />}
    </div>
  );
}
