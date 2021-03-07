import { InternalError, OPCODE } from '../../tools';
import Wrapper, { Callback } from '../../tools/wrapper';

import Geofence from '../../controllers/geofence';

export default function InternalGeofenceMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const {
      internal: { region },
      params: { regionGeofenceId },
    } = req;

    if (!regionGeofenceId) {
      throw new InternalError(
        '해당 구역을 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    req.internal.geofence = await Geofence.getGeofenceOrThrow(
      region,
      regionGeofenceId
    );

    next();
  });
}
