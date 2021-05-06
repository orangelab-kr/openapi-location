import { Callback, Geofence, InternalError, OPCODE, Wrapper } from '../..';

export function InternalGeofenceMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const {
      internal: { region },
      params: { geofenceId },
    } = req;

    if (!geofenceId) {
      throw new InternalError(
        '해당 구역을 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    req.internal.geofence = await Geofence.getGeofenceOrThrow(
      region,
      geofenceId
    );

    next();
  });
}
