import { RESULT, Wrapper, WrapperCallback } from '../..';

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

export function InternalPermissionMiddleware(
  permission: PERMISSION
): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    if (!req.internal.prs[permission]) {
      throw RESULT.PERMISSION_DENIED({ args: [PERMISSION[permission]] });
    }

    await next();
  });
}
