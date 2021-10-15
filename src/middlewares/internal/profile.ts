import { Profile, RESULT, Wrapper, WrapperCallback } from '../..';

export function InternalProfileMiddleware(): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    const {
      params: { profileId },
    } = req;

    if (!profileId) throw RESULT.CANNOT_FIND_PRICING();
    req.internal.profile = await Profile.getProfileOrThrow(profileId);
    next();
  });
}
