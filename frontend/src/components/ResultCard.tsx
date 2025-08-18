import { fmt } from '../lib/api';
import type { EstimateResponse } from '../lib/api';

export default function ResultCard({ d }: { d: EstimateResponse }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
      <h3>Airport: {d.airport}</h3>
      <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>
        Landside congestion index (ALCI): <b>{d.sources.alci?.index ?? '—'}</b>
        {' · '}
        TSA source: <b>{d.sources.tsa?.source}</b>
      </div>
      <ul>
        <li>Drive: {fmt(d.driveSeconds)}</li>
        <li>Parking/Transfer: {fmt(d.parkingTransferSeconds)}</li>
        <li>Check-in/Bag Drop: {fmt(d.checkInSeconds)}</li>
        <li>
          Security wait: {fmt(d.tsaWaitSeconds)}{' '}
          {d.sources.tsa?.source === 'tsa_api' ? '(with TSA blend)' : '(modeled)'}
        </li>
        <li>Walk to gate: {fmt(d.walkSeconds)}</li>
      </ul>
      <h2>Total: {fmt(d.totalSeconds)}</h2>
    </div>
  );
}
