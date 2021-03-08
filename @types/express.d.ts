import { PricingModel, RegionGeofenceModel, RegionModel } from '@prisma/client';
import 'express';

declare global {
  namespace Express {
    interface Request {
      internal: {
        sub: string;
        iss: string;
        aud: string;
        prs: boolean[];
        iat: Date;
        exp: Date;
        pricing: PricingModel;
        region: RegionModel;
        geofence: RegionGeofenceModel;
      };
    }
  }
}
