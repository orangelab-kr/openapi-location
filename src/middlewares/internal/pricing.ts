import { Pricing, RESULT, Wrapper, WrapperCallback } from '../..';

export function InternalPricingMiddleware(): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    const {
      params: { pricingId },
    } = req;

    if (!pricingId) throw RESULT.CANNOT_FIND_PRICING();
    req.internal.pricing = await Pricing.getPricingOrThrow(pricingId);
    next();
  });
}
