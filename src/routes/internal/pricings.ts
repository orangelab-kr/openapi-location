import OPCODE from '../../tools/opcode';
import Pricing from '../../controllers/pricing';
import PricingMiddleware from '../../middlewares/pricing';
import { Router } from 'express';
import { Wrapper } from '../../tools';

export default function getInternalPricingRouter(): Router {
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
    PricingMiddleware(),
    Wrapper(async (req, res) => {
      const { pricing } = req;
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
    PricingMiddleware(),
    Wrapper(async (req, res) => {
      const { body, pricing } = req;
      await Pricing.modifyPricing(pricing, body);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/:pricingId',
    PricingMiddleware(),
    Wrapper(async (req, res) => {
      await Pricing.deletePricing(req.pricing);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
