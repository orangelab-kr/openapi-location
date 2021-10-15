import { Router } from 'express';
import {
  clusterInfo,
  Geofence,
  getInternalRouter,
  getRegionRouter,
  InternalMiddleware,
  PlatformMiddleware,
  RESULT,
  Wrapper,
} from '..';

export * from './internal';
export * from './regions';

export function getRouter(): Router {
  const router = Router();

  router.use('/internal', InternalMiddleware(), getInternalRouter());
  router.use('/regions', PlatformMiddleware(), getRegionRouter());

  router.get(
    '/geofences',
    PlatformMiddleware({
      permissionIds: ['regions.geofenceByLocation'],
      final: true,
    }),
    Wrapper(async (req, res) => {
      const geofence = await Geofence.getGeofenceByLocation(req.query);
      throw RESULT.SUCCESS({ details: { geofence } });
    })
  );

  router.get(
    '/',
    Wrapper(async () => {
      throw RESULT.SUCCESS({ details: clusterInfo });
    })
  );

  return router;
}
