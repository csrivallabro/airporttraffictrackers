import { useState } from 'react';
import { fetchEstimate } from '../lib/api';

export default function EstimateForm({ onResult }: { onResult: (d: any) => void }) {
  const [origin, setOrigin] = useState('');
  const [airport, setAirport] = useState('LAX');
  const [departure, setDeparture] = useState('');
  const [precheck, setPrecheck] = useState(true);
  const [carryOnOnly, setCarryOnOnly] = useState(true);
  const [parking, setParking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEstimate({
        origin,
        airport,
        departure,
        precheck,
        carryOnOnly,
        parking,
      });
      onResult(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to estimate');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
      <input required placeholder="Your starting address" value={origin} onChange={e=>setOrigin(e.target.value)} />
      <select value={airport} onChange={e=>setAirport(e.target.value)}>
        <option>LAX</option>
        <option>SFO</option>
      </select>
      <input type="datetime-local" value={departure} onChange={e=>setDeparture(e.target.value)} />
      <label><input type="checkbox" checked={precheck} onChange={e=>setPrecheck(e.target.checked)} /> TSA PreCheck</label>
      <label><input type="checkbox" checked={carryOnOnly} onChange={e=>setCarryOnOnly(e.target.checked)} /> Carry-on only</label>
      <label><input type="checkbox" checked={parking} onChange={e=>setParking(e.target.checked)} /> I will park & shuttle</label>
      <button disabled={loading}>{loading ? 'Calculating…' : 'Estimate time'}</button>
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
    </form>
  );
}
