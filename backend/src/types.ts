export type EstimateParams = {
    origin: string;
    airport: string;
    departure?: string; // ISO string
    precheck?: boolean;
    clear?: boolean;
    carryOnOnly?: boolean;
    parking?: boolean;
  };
  
  export type EstimateResult = {
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
  