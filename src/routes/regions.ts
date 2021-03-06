import { OPCODE, Wrapper } from '../tools';

import Region from '../controllers/region';
import { Router } from 'express';

export default function getRegionRouter(): Router {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req, res) => {
      const regions = await Region.getShortRegionsForUser();
      res.json({ opcode: OPCODE.SUCCESS, regions });
    })
  );

  router.get(
    '/all',
    Wrapper(async (req, res) => {
      const regions = await Region.getRegionsForUser();
      res.json({ opcode: OPCODE.SUCCESS, regions });
    })
  );

  router.get(
    '/:regionId',
    Wrapper(async (req, res) => {
      const { regionId } = req.params;
      const regions = await Region.getRegionsForUser(regionId);
      res.json({ opcode: OPCODE.SUCCESS, regions });
    })
  );

  return router;
}
