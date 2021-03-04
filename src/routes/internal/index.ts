import { Router } from 'express';
import getInternalPricingsRouter from './pricings';
import getInternalRegionsRouter from './regions';

export default function getInternalRouter(): Router {
  const router = Router();

  router.use('/regions', getInternalRegionsRouter());
  router.use('/pricings', getInternalPricingsRouter());

  return router;
}
