import { Router } from 'express';
import { PlatformMiddleware, Region, RESULT, Wrapper } from '..';

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
      throw RESULT.SUCCESS({ details: { regions } });
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
      throw RESULT.SUCCESS({ details: { regions } });
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
      throw RESULT.SUCCESS({ details: { region } });
    })
  );

  return router;
}
