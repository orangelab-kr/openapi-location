import InternalPricingMiddleware from '../../middlewares/internal/pricing';
import OPCODE from '../../tools/opcode';
import Pricing from '../../controllers/pricing';
import { Router } from 'express';
import { Wrapper } from '../../tools';

export default function getInternalPricingsRouter(): Router {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const { pricings, total } = await Pricing.getPricings(req.query);
      res.json({ opcode: OPCODE.SUCCESS, pricings, total });
    })
  );

  router.get(
    '/:pricingId',
    InternalPricingMiddleware(),
    Wrapper(async (req, res) => {
      const { pricing } = req.internal;
      res.json({ opcode: OPCODE.SUCCESS, pricing });
    })
  );

  router.post(
    '/',
    Wrapper(async (req, res) => {
      const { pricingId } = await Pricing.createPricing(req.body);
      res.json({ opcode: OPCODE.SUCCESS, pricingId });
    })
  );

  router.post(
    '/:pricingId',
    InternalPricingMiddleware(),
    Wrapper(async (req, res) => {
      const { body, internal } = req;
      await Pricing.modifyPricing(internal.pricing, body);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/:pricingId',
    InternalPricingMiddleware(),
    Wrapper(async (req, res) => {
      await Pricing.deletePricing(req.internal.pricing);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
