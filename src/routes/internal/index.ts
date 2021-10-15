import { Router } from 'express';
import {
  Geofence,
  getInternalPricingsRouter,
  getInternalProfilesRouter,
  getInternalRegionsRouter,
  InternalPermissionMiddleware,
  PERMISSION,
  RESULT,
  Wrapper,
} from '../..';

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
      throw RESULT.SUCCESS({ details: { geofence } });
    })
  );

  return router;
}
