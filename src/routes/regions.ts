import { OPCODE, PlatformMiddleware, Region, Wrapper } from '..';

import { Router } from 'express';

export function getRegionRouter(): Router {
  const router = Router();

  router.get(
    '/',
    PlatformMiddleware({
      permissionIds: ['regions.list'],
      final: true,
    }),
    Wrapper(async (req, res) => {
      const regions = await Region.getShortRegionsForUser();
      res.json({ opcode: OPCODE.SUCCESS, regions });
    })
  );

  router.get(
    '/all',
    PlatformMiddleware({
      permissionIds: ['regions.all'],
      final: true,
    }),
    Wrapper(async (req, res) => {
      const regions = await Region.getRegionsForUser();
      res.json({ opcode: OPCODE.SUCCESS, regions });
    })
  );

  router.get(
    '/:regionId',
    PlatformMiddleware({
      permissionIds: ['regions.view'],
      final: true,
    }),
    Wrapper(async (req, res) => {
      const { regionId } = req.params;
      const region = await Region.getRegionForUserOrThrow(regionId);
      res.json({ opcode: OPCODE.SUCCESS, region });
    })
  );

  return router;
}
