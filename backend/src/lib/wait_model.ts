export function predictStandardWaitMinutes(params: {
  alci: number;
  departures: number;
  now?: Date;
}) {
  const { alci, departures } = params;
  const now = params.now ?? new Date();

  const hour = now.getHours();
  const dow = now.getDay(); // 0=Sun

  let todBump = 0;
  if (hour >= 5 && hour <= 8) todBump += 8;
  if (hour >= 15 && hour <= 20) todBump += 5;
  if (dow === 5) todBump += 3;
  if (dow === 0 || dow === 6) todBump += 2;

  const base = 8;
  const alciTerm = 22 * Math.max(0, alci - 1);
  const depTerm = 0.04 * Math.max(0, departures);

  const raw = base + alciTerm + depTerm + todBump;
  return Math.max(5, Math.min(90, Math.round(raw)));
}

export function scaleToPrecheck(standardMinutes: number) {
  const scaled = Math.round(standardMinutes * 0.5);
  return Math.max(7, Math.min(60, scaled));
}

export function blendTsaAndModel(args: {
  modelMinutes: number;
  tsaMinutes: number | null;
  tsaAgeMin: number | null;
}) {
  const { modelMinutes, tsaMinutes, tsaAgeMin } = args;
  if (tsaMinutes == null || tsaAgeMin == null || !isFinite(tsaAgeMin)) {
    return { finalMinutes: modelMinutes, alpha: 0 };
  }
  let alpha = 0.6;
  if (tsaAgeMin <= 15) alpha = 0.8;
  else if (tsaAgeMin <= 60) alpha = 0.6;
  else if (tsaAgeMin <= 90) alpha = 0.4;

  const final = Math.round(alpha * tsaMinutes + (1 - alpha) * modelMinutes);
  return { finalMinutes: final, alpha };
}
