import { InternalError, OPCODE } from '../tools';
import Wrapper, { Callback } from '../tools/wrapper';

import Pricing from '../controllers/pricing';

export default function PricingMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const {
      params: { pricingId },
    } = req;

    if (!pricingId) {
      throw new InternalError(
        '해당 가격 정책을 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    req.pricing = await Pricing.getPricingOrThrow(pricingId);
    next();
  });
}
