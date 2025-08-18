import { Router } from 'express';
import airports from '../data/airports.json' assert { type: 'json' };
import { z } from 'zod';
import { cacheKey, getCache, setCache } from '../lib/cache.js';
import { getDriveTimeSeconds } from '../lib/google.js';
import { getALCI } from '../lib/alci.js';
import { getDeparturesCount } from '../lib/flights.js';
import { blendTsaAndModel, predictStandardWaitMinutes, scaleToPrecheck } from '../lib/wait_model.js';
import { getFreshTsaReportMinutes } from '../lib/tsa.js';
import { CONFIG } from '../config.js';

const schema = z.object({
  origin: z.string().min(3),
  airport: z.string().toUpperCase(),
  departure: z.string().datetime().optional(),
  precheck: z.coerce.boolean().optional(),
  clear: z.coerce.boolean().optional(),
  carryOnOnly: z.coerce.boolean().optional(),
  parking: z.coerce.boolean().optional()
});

export const estimateRouter = Router();

estimateRouter.get('/', async (req, res) => {
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { origin, airport, departure, precheck, carryOnOnly, parking } = parsed.data as any;
  const ap = (airports as any)[airport];
  if (!ap) return res.status(404).json({ error: `Unknown airport ${airport}` });

  const key = cacheKey({ origin, airport, departure, precheck, carryOnOnly, parking, v: 'alci1' });
  const cached = getCache<any>(key);
  if (cached) return res.json(cached);

  try {
    const drive = await getDriveTimeSeconds({ origin, lat: ap.lat, lng: ap.lng, departure });

    const alci = await getALCI(airport);
    const deps = await getDeparturesCount(airport, 90, 30);

    const modelStd = predictStandardWaitMinutes({ alci: alci.index, departures: deps });

    const tsaFresh = await getFreshTsaReportMinutes(airport);
    const blendedStd = blendTsaAndModel({
      modelMinutes: modelStd,
      tsaMinutes: tsaFresh.minutes,
      tsaAgeMin: tsaFresh.ageMinutes
    });

    const stdMinutes = blendedStd.finalMinutes;
    const finalMinutes = precheck ? scaleToPrecheck(stdMinutes) : stdMinutes;

    const checkInMin = carryOnOnly ? ap.defaults.checkInCarryOnMin : ap.defaults.checkInBagDropMin;
    const parkingMin = parking ? ap.defaults.parkingTransferMin : 0;
    const walkMin = ap.defaults.walkToGateMin;

    const result = {
      airport,
      driveSeconds: drive.seconds,
      parkingTransferSeconds: parkingMin * 60,
      checkInSeconds: checkInMin * 60,
      tsaWaitSeconds: finalMinutes * 60,
      walkSeconds: walkMin * 60,
      totalSeconds:
        drive.seconds + parkingMin * 60 + checkInMin * 60 + finalMinutes * 60 + walkMin * 60,
      sources: {
        google: { distanceMeters: drive.distanceMeters, durationSeconds: drive.seconds },
        tsa: {
          source: tsaFresh.usedFresh ? 'tsa_api' : 'model',
          latestReportMinutes: tsaFresh.minutes,
          latestReportAgeMin: tsaFresh.ageMinutes,
          blendAlpha: tsaFresh.usedFresh ? blendedStd.alpha : 0
        },
        alci: { index: alci.index, probes: alci.details },
        flights: { departuresWindowCount: deps }
      }
    };

    setCache(key, result, CONFIG.cacheTtlSeconds);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Internal error' });
  }
});
