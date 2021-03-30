import Wrapper, { Callback } from '../../tools/wrapper';

import InternalError from '../../tools/error';
import { OPCODE } from '../../tools';

export enum PERMISSION {
  REGIONS_LIST,
  REGIONS_VIEW,
  REGIONS_CREATE,
  REGIONS_MODIFY,
  REGIONS_DELETE,

  GEOFENCES_LOCATION,
  GEOFENCES_LIST,
  GEOFENCES_VIEW,
  GEOFENCES_CREATE,
  GEOFENCES_MODIFY,
  GEOFENCES_DELETE,

  PRICINGS_LIST,
  PRICINGS_VIEW,
  PRICINGS_CREATE,
  PRICINGS_MODIFY,
  PRICINGS_DELETE,

  PROFILES_LIST,
  PROFILES_VIEW,
  PROFILES_CREATE,
  PROFILES_MODIFY,
  PROFILES_DELETE,
}

export default function InternalPermissionMiddleware(
  permission: PERMISSION
): Callback {
  return Wrapper(async (req, res, next) => {
    if (!req.internal.prs[permission]) {
      throw new InternalError(
        `${PERMISSION[permission]} 권한이 없습니다.`,
        OPCODE.ACCESS_DENIED
      );
    }

    await next();
  });
}
