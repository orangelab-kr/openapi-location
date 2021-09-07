import { Router } from 'express';
import {
  clusterInfo,
  Geofence,
  getInternalRouter,
  getRegionRouter,
  InternalMiddleware,
  OPCODE,
  PlatformMiddleware,
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
      permissionIds: ['regions.geofencebyLocation'],
      final: true,
    }),
    Wrapper(async (req, res) => {
      const geofence = await Geofence.getGeofenceByLocation(req.query);
      res.json({ opcode: OPCODE.SUCCESS, geofence });
    })
  );

  router.get(
    '/',
    Wrapper(async (_req, res) => {
      res.json({
        opcode: OPCODE.SUCCESS,
        ...clusterInfo,
      });
    })
  );

  return router;
}
