import {
  Geofence,
  InternalPermissionMiddleware,
  OPCODE,
  PERMISSION,
  Wrapper,
  getInternalPricingsRouter,
  getInternalProfilesRouter,
  getInternalRegionsRouter,
} from '../..';

import { Router } from 'express';

export * from './pricings';
export * from './profiles';
export * from './regions';

export function getInternalRouter(): Router {
  const router = Router();

  router.use('/regions', getInternalRegionsRouter());
  router.use('/pricings', getInternalPricingsRouter());
  router.use('/profiles', getInternalProfilesRouter());
  router.get(
    '/geofences',
    InternalPermissionMiddleware(PERMISSION.GEOFENCES_LOCATION),
    Wrapper(async (req, res) => {
      const geofence = await Geofence.getGeofenceByLocation(req.query);
      res.json({ opcode: OPCODE.SUCCESS, geofence });
    })
  );

  return router;
}
