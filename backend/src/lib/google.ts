import { CONFIG } from '../config.js';

export async function getDriveTimeSeconds(opts: {
  origin: string;
  lat: number;
  lng: number;
  departure?: string;
}) {
  const { origin, lat, lng, departure } = opts;
  const departure_time = departure
    ? Math.floor(new Date(departure).getTime() / 1000)
    : Math.floor(Date.now() / 1000);
  const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
  url.searchParams.set('origins', origin);
  url.searchParams.set('destinations', `${lat},${lng}`);
  url.searchParams.set('key', CONFIG.googleApiKey);
  url.searchParams.set('departure_time', String(departure_time));
  url.searchParams.set('traffic_model', 'best_guess');
  url.searchParams.set('units', 'imperial');

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google API error: ${res.status}`);
  const data = await res.json();

  const elem = data?.rows?.[0]?.elements?.[0];
  const durationInTraffic = elem?.duration_in_traffic?.value ?? elem?.duration?.value;
  const distance = elem?.distance?.value ?? 0;

  return {
    seconds: Number(durationInTraffic || 0),
    distanceMeters: Number(distance || 0),
  };
}
