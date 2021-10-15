import { Geofence, RESULT, Wrapper, WrapperCallback } from '../..';

export function InternalGeofenceMiddleware(): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    const {
      internal: { region },
      params: { geofenceId },
    } = req;

    if (!geofenceId) throw RESULT.CANNOT_FIND_GEOFENCE();
    req.internal.geofence = await Geofence.getGeofenceOrThrow(
      region,
      geofenceId
    );

    next();
  });
}
