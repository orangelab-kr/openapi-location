import {
  GeofenceModel,
  PricingModel,
  ProfileModel,
  RegionModel,
} from '@prisma/client';
import 'express';
import {
  InternalPlatform,
  InternalPlatformAccessKey,
  InternalPlatformUser,
} from '@hikick/openapi-internal-sdk';

declare global {
  namespace Express {
    interface Request {
      permissionIds: string[];
      loggined: {
        platform: InternalPlatform;
        accessKey?: InternalPlatformAccessKey;
        user?: InternalPlatformUser;
      };
      internal: {
        sub: string;
        iss: string;
        aud: string;
        prs: boolean[];
        iat: Date;
        exp: Date;
        pricing: PricingModel;
        region: RegionModel;
        geofence: GeofenceModel;
        profile: ProfileModel;
      };
    }
  }
}
