import InternalPermissionMiddleware, {
  PERMISSION,
} from '../../middlewares/internal/permissions';
import { OPCODE, Wrapper } from '../../tools';

import Geofence from '../../controllers/geofence';
import { Router } from 'express';
import getInternalPricingsRouter from './pricings';
import getInternalRegionsRouter from './regions';

export default function getInternalRouter(): Router {
  const router = Router();

  router.use('/regions', getInternalRegionsRouter());
  router.use('/pricings', getInternalPricingsRouter());
  router.get(
    '/type',
    InternalPermissionMiddleware(PERMISSION.GEOFENCES_TYPE),
    Wrapper(async (req, res) => {
      const type = await Geofence.getGeofenceTypeByLocation(req.query);
      res.json({ opcode: OPCODE.SUCCESS, type });
    })
  );

  return router;
}
