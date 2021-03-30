import { InternalError, OPCODE } from '../../tools';
import Wrapper, { Callback } from '../../tools/wrapper';

import Profile from '../../controllers/profile';

export default function InternalProfileMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const {
      params: { profileId },
    } = req;

    if (!profileId) {
      throw new InternalError(
        '해당 가격 정책을 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    req.internal.profile = await Profile.getProfileOrThrow(profileId);
    next();
  });
}
