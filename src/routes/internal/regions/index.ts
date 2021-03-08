import InternalPermissionMiddleware, {
  PERMISSION,
} from '../../../middlewares/internal/permissions';
import { OPCODE, Wrapper } from '../../../tools';

import { InternalRegionMiddleware } from '../../../middlewares';
import Region from '../../../controllers/region';
import { Router } from 'express';
import getInternalRegionsGeofencesRouter from './geofences';

export default function getInternalRegionsRouter(): Router {
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
      res.json({ opcode: OPCODE.SUCCESS, regions, total });
    })
  );

  router.get(
    '/:regionId',
    InternalPermissionMiddleware(PERMISSION.REGIONS_VIEW),
    InternalRegionMiddleware(),
    Wrapper(async (req, res) => {
      const { region } = req.internal;
      res.json({ opcode: OPCODE.SUCCESS, region });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.REGIONS_CREATE),
    Wrapper(async (req, res) => {
      const { regionId } = await Region.createRegion(req.body);
      res.json({ opcode: OPCODE.SUCCESS, regionId });
    })
  );

  router.post(
    '/:regionId',
    InternalPermissionMiddleware(PERMISSION.REGIONS_MODIFY),
    InternalRegionMiddleware(),
    Wrapper(async (req, res) => {
      const { body, internal } = req;
      await Region.modifyRegion(internal.region, body);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/:regionId',
    InternalPermissionMiddleware(PERMISSION.REGIONS_DELETE),
    InternalRegionMiddleware(),
    Wrapper(async (req, res) => {
      await Region.deleteRegion(req.internal.region);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
