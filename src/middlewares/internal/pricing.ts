import { Callback, InternalError, OPCODE, Pricing, Wrapper } from '../..';

export function InternalPricingMiddleware(): Callback {
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

    req.internal.pricing = await Pricing.getPricingOrThrow(pricingId);
    next();
  });
}
