import { Region, RESULT, Wrapper, WrapperCallback } from '../..';

export function InternalRegionMiddleware(): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    const {
      params: { regionId },
    } = req;

    if (!regionId) throw RESULT.CANNOT_FIND_REGION();
    req.internal.region = await Region.getRegionOrThrow(regionId);
    next();
  });
}
