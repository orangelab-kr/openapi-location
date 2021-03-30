import InternalPermissionMiddleware, {
  PERMISSION,
} from '../../middlewares/internal/permissions';
import { OPCODE, Wrapper } from '../../tools';

import Geofence from '../../controllers/geofence';
import { Router } from 'express';
import getInternalPricingsRouter from './pricings';
import getInternalProfilesRouter from './profiles';
import getInternalRegionsRouter from './regions';

export default function getInternalRouter(): Router {
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
