import { CONFIG } from '../config.js';

/**
 * Count scheduled departures in a window [fromMin, toMin] relative to now.
 * This is a stub that returns 0 unless you configure a flight data provider.
 * Wire to your provider of choice; adapt the URL/headers/response parsing below.
 */
export async function getDeparturesCount(
  airportCode: string,
  fromMin = 90,
  toMin = 30
): Promise<number> {
  if (!CONFIG.aeroboxKey || !CONFIG.aeroboxHost) return 0; // feature disabled

  try {
    const now = new Date();
    const from = new Date(now.getTime() + fromMin * 60 * 1000).toISOString();
    const to = new Date(now.getTime() + toMin * 60 * 1000).toISOString();

    // NOTE: Replace this endpoint with your actual provider (IATA vs ICAO matters).
    const url = new URL(
      `https://${CONFIG.aeroboxHost}/flights/airports/iata/${airportCode}/departures`
    );
    url.searchParams.set('from', from);
    url.searchParams.set('to', to);
    url.searchParams.set('with_codeshared', 'false');

    const res = await fetch(url, {
      headers: { 'x-rapidapi-key': CONFIG.aeroboxKey, 'x-rapidapi-host': CONFIG.aeroboxHost }
    });
    if (!res.ok) return 0;
    const json = await res.json();
    const list = Array.isArray(json) ? json : (json?.departures || json?.data || []);
    return Number(list?.length || 0);
  } catch {
    return 0;
  }
}
