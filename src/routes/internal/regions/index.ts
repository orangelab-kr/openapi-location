import { Router } from 'express';
import {
  getInternalRegionsGeofencesRouter,
  InternalPermissionMiddleware,
  InternalRegionMiddleware,
  PERMISSION,
  Region,
  RESULT,
  Wrapper,
} from '../../..';

export * from './geofences';

export function getInternalRegionsRouter(): Router {
  const router = Router();

  router.use(
    '/:regionId/geofences',
    InternalRegionMiddleware(),
    getInternalRegionsGeofencesRouter()
  );

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.REGIONS_LIST),
    Wrapper(async (req, res) => {
      const { regions, total } = await Region.getRegions(req.query);
      throw RESULT.SUCCESS({ details: { regions, total } });
    })
  );

  router.get(
    '/:regionId',
    InternalPermissionMiddleware(PERMISSION.REGIONS_VIEW),
    InternalRegionMiddleware(),
    Wrapper(async (req, res) => {
      const { region } = req.internal;
      throw RESULT.SUCCESS({ details: { region } });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.REGIONS_CREATE),
    Wrapper(async (req, res) => {
      const { regionId } = await Region.createRegion(req.body);
      throw RESULT.SUCCESS({ details: { regionId } });
    })
  );

  router.post(
    '/:regionId',
    InternalPermissionMiddleware(PERMISSION.REGIONS_MODIFY),
    InternalRegionMiddleware(),
    Wrapper(async (req, res) => {
      const { body, internal } = req;
      await Region.modifyRegion(internal.region, body);
      throw RESULT.SUCCESS();
    })
  );

  router.delete(
    '/:regionId',
    InternalPermissionMiddleware(PERMISSION.REGIONS_DELETE),
    InternalRegionMiddleware(),
    Wrapper(async (req, res) => {
      await Region.deleteRegion(req.internal.region);
      throw RESULT.SUCCESS();
    })
  );

  return router;
}
