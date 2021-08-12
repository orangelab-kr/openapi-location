import { OPCODE, Region, Wrapper } from '..';

import { Router } from 'express';

export function getRegionRouter(): Router {
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
      const region = await Region.getRegionForUserOrThrow(regionId);
      res.json({ opcode: OPCODE.SUCCESS, region });
    })
  );

  return router;
}
