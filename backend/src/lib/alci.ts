import { CONFIG } from '../config.js';
import airports from '../data/airports.json' assert { type: 'json' };

type Probe = {
  id: string;
  o: { lat: number; lng: number };
  d: { lat: number; lng: number };
  freeFlowSec: number;
  weight: number;
};

export async function getALCI(airportCode: string): Promise<{
  index: number;
  details: Array<{ id: string; durationSec: number; ratio: number }>;
}> {
  const ap = (airports as any)[airportCode];
  const probes = (ap?.probes || []) as Probe[];
  if (!ap || probes.length === 0) {
    return { index: 1.0, details: [] };
  }

  const now = Math.floor(Date.now() / 1000);
  const results: Array<{ id: string; durationSec: number; ratio: number }> = [];
  let weightedSum = 0;
  let totalW = 0;

  for (const p of probes) {
    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
    url.searchParams.set('origins', `${p.o.lat},${p.o.lng}`);
    url.searchParams.set('destinations', `${p.d.lat},${p.d.lng}`);
    url.searchParams.set('departure_time', String(now));
    url.searchParams.set('traffic_model', 'best_guess');
    url.searchParams.set('key', CONFIG.googleApiKey);

    const res = await fetch(url);
    if (!res.ok) continue;
    const json = await res.json();
    const elem = json?.rows?.[0]?.elements?.[0];
    const dur = Number(elem?.duration_in_traffic?.value ?? elem?.duration?.value ?? 0);
    if (!dur || !p.freeFlowSec) continue;

    const ratio = Math.max(1, Math.min(3, dur / p.freeFlowSec));
    results.push({ id: p.id, durationSec: dur, ratio });

    weightedSum += ratio * (p.weight ?? 1);
    totalW += (p.weight ?? 1);
  }

  const index = totalW ? Number((weightedSum / totalW).toFixed(2)) : 1.0;
  return { index, details: results };
}
