import { Router } from 'express';
import {
  InternalPermissionMiddleware,
  InternalPricingMiddleware,
  PERMISSION,
  Pricing,
  RESULT,
  Wrapper,
} from '../..';

export function getInternalPricingsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.PRICINGS_LIST),
    Wrapper(async (req, res) => {
      const { pricings, total } = await Pricing.getPricings(req.query);
      throw RESULT.SUCCESS({ details: { pricings, total } });
    })
  );

  router.get(
    '/:pricingId',
    InternalPermissionMiddleware(PERMISSION.PRICINGS_VIEW),
    InternalPricingMiddleware(),
    Wrapper(async (req, res) => {
      const { pricing } = req.internal;
      throw RESULT.SUCCESS({ details: { pricing } });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.PRICINGS_CREATE),
    Wrapper(async (req, res) => {
      const { pricingId } = await Pricing.createPricing(req.body);
      throw RESULT.SUCCESS({ details: { pricingId } });
    })
  );

  router.post(
    '/:pricingId',
    InternalPermissionMiddleware(PERMISSION.PRICINGS_MODIFY),
    InternalPricingMiddleware(),
    Wrapper(async (req, res) => {
      const { body, internal } = req;
      await Pricing.modifyPricing(internal.pricing, body);
      throw RESULT.SUCCESS();
    })
  );

  router.delete(
    '/:pricingId',
    InternalPermissionMiddleware(PERMISSION.PRICINGS_DELETE),
    InternalPricingMiddleware(),
    Wrapper(async (req, res) => {
      await Pricing.deletePricing(req.internal.pricing);
      throw RESULT.SUCCESS();
    })
  );

  return router;
}
