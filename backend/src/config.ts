import 'dotenv/config';

export const CONFIG = {
  port: Number(process.env.PORT || 8080),
  googleApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  tsaApiKey: process.env.TSA_API_KEY || '',
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS || 180),
  tsaFreshnessMin: Number(process.env.TSA_FRESHNESS_MINUTES || 90),
  aeroboxKey: process.env.AERODATABOX_API_KEY || '',
  aeroboxHost: process.env.AERODATABOX_HOST || ''
};
