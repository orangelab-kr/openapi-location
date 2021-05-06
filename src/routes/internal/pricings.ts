import {
  InternalPermissionMiddleware,
  InternalPricingMiddleware,
  OPCODE,
  PERMISSION,
  Pricing,
  Wrapper,
} from '../..';

import { Router } from 'express';

export function getInternalPricingsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.PRICINGS_LIST),
    Wrapper(async (req, res) => {
      const { pricings, total } = await Pricing.getPricings(req.query);
      res.json({ opcode: OPCODE.SUCCESS, pricings, total });
    })
  );

  router.get(
    '/:pricingId',
    InternalPermissionMiddleware(PERMISSION.PRICINGS_VIEW),
    InternalPricingMiddleware(),
    Wrapper(async (req, res) => {
      const { pricing } = req.internal;
      res.json({ opcode: OPCODE.SUCCESS, pricing });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.PRICINGS_CREATE),
    Wrapper(async (req, res) => {
      const { pricingId } = await Pricing.createPricing(req.body);
      res.json({ opcode: OPCODE.SUCCESS, pricingId });
    })
  );

  router.post(
    '/:pricingId',
    InternalPermissionMiddleware(PERMISSION.PRICINGS_MODIFY),
    InternalPricingMiddleware(),
    Wrapper(async (req, res) => {
      const { body, internal } = req;
      await Pricing.modifyPricing(internal.pricing, body);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/:pricingId',
    InternalPermissionMiddleware(PERMISSION.PRICINGS_DELETE),
    InternalPricingMiddleware(),
    Wrapper(async (req, res) => {
      await Pricing.deletePricing(req.internal.pricing);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
