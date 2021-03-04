import { PricingModel, RegionModel } from '@prisma/client';
import 'express';

declare global {
  namespace Express {
    interface Request {
      internal: {
        sub: string;
        iss: string;
        aud: string;
        prs: string[];
        iat: Date;
        exp: Date;
        pricing: PricingModel;
        region: RegionModel;
      };
    }
  }
}
