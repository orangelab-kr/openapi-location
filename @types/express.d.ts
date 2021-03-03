import { PricingModel } from '@prisma/client';
import 'express';

declare global {
  namespace Express {
    interface Request {
      pricing: PricingModel;
      internal: {
        sub: string;
        iss: string;
        aud: string;
        prs: string[];
        iat: Date;
        exp: Date;
      };
    }
  }
}
