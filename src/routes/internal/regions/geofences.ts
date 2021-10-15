import { Router } from 'express';
import {
  Geofence,
  InternalGeofenceMiddleware,
  InternalPermissionMiddleware,
  PERMISSION,
  RESULT,
  Wrapper,
} from '../../..';

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
      throw RESULT.SUCCESS({ details: { geofences, total } });
    })
  );

  router.get(
    '/:geofenceId',
    InternalPermissionMiddleware(PERMISSION.GEOFENCES_VIEW),
    InternalGeofenceMiddleware(),
    Wrapper(async (req, res) => {
      const { geofence } = req.internal;
      throw RESULT.SUCCESS({ details: { geofence } });
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
      throw RESULT.SUCCESS({ details: { geofenceId } });
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
      throw RESULT.SUCCESS();
    })
  );

  router.delete(
    '/:geofenceId',
    InternalPermissionMiddleware(PERMISSION.GEOFENCES_DELETE),
    InternalGeofenceMiddleware(),
    Wrapper(async (req, res) => {
      const { region, geofence } = req.internal;
      await Geofence.deleteGeofence(region, geofence);
      throw RESULT.SUCCESS();
    })
  );

  return router;
}
