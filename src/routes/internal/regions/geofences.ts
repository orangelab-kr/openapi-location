import { OPCODE, Wrapper } from '../../../tools';

import Geofence from '../../../controllers/geofence';
import { InternalGeofenceMiddleware } from '../../../middlewares';
import { Router } from 'express';

export default function getInternalRegionsGeofencesRouter(): Router {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const {
        query,
        internal: { region },
      } = req;

      const { geofences, total } = await Geofence.getGeofences(region, query);
      res.json({ opcode: OPCODE.SUCCESS, geofences, total });
    })
  );

  router.get(
    '/:regionGeofenceId',
    InternalGeofenceMiddleware(),
    Wrapper(async (req, res) => {
      const { geofence } = req.internal;
      res.json({ opcode: OPCODE.SUCCESS, geofence });
    })
  );

  router.post(
    '/',
    Wrapper(async (req, res) => {
      const {
        body,
        internal: { region },
      } = req;

      const { regionGeofenceId } = await Geofence.createGeofence(region, body);
      res.json({ opcode: OPCODE.SUCCESS, regionGeofenceId });
    })
  );

  router.post(
    '/:regionGeofenceId',
    InternalGeofenceMiddleware(),
    Wrapper(async (req, res) => {
      const {
        body,
        internal: { region, geofence },
      } = req;

      await Geofence.modifyGeofence(region, geofence, body);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/:regionGeofenceId',
    InternalGeofenceMiddleware(),
    Wrapper(async (req, res) => {
      const { region, geofence } = req.internal;
      await Geofence.deleteGeofence(region, geofence);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
