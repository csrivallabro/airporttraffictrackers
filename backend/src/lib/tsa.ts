import { CONFIG } from '../config.js';

const LABEL_TO_MIN: Record<string, number> = {
  '0-10': 7,
  '10-30': 20,
  '30-45': 38,
  '45-60': 53,
  '60+': 75,
  short: 10,
  medium: 25,
  long: 45,
  very_long: 75,
  excessive: 75
};

function mapLabelToMinutes(label: string | undefined) {
  if (!label) return undefined;
  const key = label.toLowerCase().replace(/\s+/g, '_');
  return LABEL_TO_MIN[key] ?? LABEL_TO_MIN[label] ?? undefined;
}

/** Fetch the most recent TSA report within freshness window; returns mapped minutes or null. */
export async function getFreshTsaReportMinutes(airportCode: string): Promise<{
  minutes: number | null;
  ageMinutes: number | null;
  usedFresh: boolean;
  source: 'tsa_api' | 'heuristic' | 'none';
}> {
  if (!CONFIG.tsaApiKey) return { minutes: null, ageMinutes: null, usedFresh: false, source: 'none' };

  try {
    // TODO: Replace with your actual TSA/MyTSA endpoint & response mapping.
    const url = new URL('https://api.example-tsa.com/waittimes');
    url.searchParams.set('airport', airportCode);
    url.searchParams.set('apikey', CONFIG.tsaApiKey);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`TSA API error ${res.status}`);
    const json = await res.json();

    // Expect: json.items = [{ createdUtc, label }, ...]
    const items: Array<{ createdUtc?: string; label?: string }> = json?.items ?? [];
    const now = Date.now();
    const fresh = items
      .map((it) => {
        const t = it.createdUtc ? new Date(it.createdUtc).getTime() : NaN;
        const ageMin = isFinite(t) ? (now - t) / 60000 : Infinity;
        return { minutes: mapLabelToMinutes(it.label), ageMin };
      })
      .filter((x) => x.minutes != null && x.ageMin <= CONFIG.tsaFreshnessMin)
      .sort((a, b) => a.ageMin - b.ageMin);

    if (fresh.length === 0) {
      return { minutes: null, ageMinutes: null, usedFresh: false, source: 'none' };
    }
    return { minutes: fresh[0].minutes!, ageMinutes: fresh[0].ageMin, usedFresh: true, source: 'tsa_api' };
  } catch {
    return { minutes: null, ageMinutes: null, usedFresh: false, source: 'none' };
  }
}
