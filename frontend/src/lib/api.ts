const BASE = import.meta.env.VITE_API_BASE_URL;

export type EstimateResponse = {
  airport: string;
  driveSeconds: number;
  parkingTransferSeconds: number;
  checkInSeconds: number;
  tsaWaitSeconds: number;
  walkSeconds: number;
  totalSeconds: number;
  sources: {
    google: { distanceMeters: number; durationSeconds: number };
    tsa: { source: string; latestReportMinutes?: number | null; latestReportAgeMin?: number | null; blendAlpha?: number };
    alci?: { index: number; probes: Array<{ id: string; durationSec: number; ratio: number }> };
    flights?: { departuresWindowCount: number };
  };
};

export async function fetchEstimate(params: Record<string, string | boolean>) {
  const url = new URL('/api/estimate', BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch estimate');
  return (await res.json()) as EstimateResponse;
}

export function fmt(seconds: number) {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return `${h}h ${r}m`;
}
