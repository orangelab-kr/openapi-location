import {
  Geofence,
  InternalGeofenceMiddleware,
  InternalPermissionMiddleware,
  OPCODE,
  PERMISSION,
  Wrapper,
} from '../../..';

import { Router } from 'express';

export function getInternalRegionsGeofencesRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.GEOFENCES_LIST),
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
    '/:geofenceId',
    InternalPermissionMiddleware(PERMISSION.GEOFENCES_VIEW),
    InternalGeofenceMiddleware(),
    Wrapper(async (req, res) => {
      const { geofence } = req.internal;
      res.json({ opcode: OPCODE.SUCCESS, geofence });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.GEOFENCES_CREATE),
    Wrapper(async (req, res) => {
      const {
        body,
        internal: { region },
      } = req;

      const { geofenceId } = await Geofence.createGeofence(region, body);
      res.json({ opcode: OPCODE.SUCCESS, geofenceId });
    })
  );

  router.post(
    '/:geofenceId',
    InternalPermissionMiddleware(PERMISSION.GEOFENCES_MODIFY),
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
    '/:geofenceId',
    InternalPermissionMiddleware(PERMISSION.GEOFENCES_DELETE),
    InternalGeofenceMiddleware(),
    Wrapper(async (req, res) => {
      const { region, geofence } = req.internal;
      await Geofence.deleteGeofence(region, geofence);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
