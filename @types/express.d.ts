import { PricingModel, RegionGeofenceModel, RegionModel } from '@prisma/client';
import 'express';
import { InternalPlatformAccessKey } from 'openapi-internal-sdk';

declare global {
  namespace Express {
    interface Request {
      accessKey: InternalPlatformAccessKey;
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
