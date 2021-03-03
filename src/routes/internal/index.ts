import { Router } from 'express';
import getInternalPricingRouter from './pricings';

export default function getInternalRouter(): Router {
  const router = Router();

  router.use('/pricings', getInternalPricingRouter());

  return router;
}
