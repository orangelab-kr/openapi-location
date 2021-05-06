import { Callback, InternalError, OPCODE, Region, Wrapper } from '../..';

export function InternalRegionMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const {
      params: { regionId },
    } = req;

    if (!regionId) {
      throw new InternalError(
        '해당 지역을 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    req.internal.region = await Region.getRegionOrThrow(regionId);
    next();
  });
}
