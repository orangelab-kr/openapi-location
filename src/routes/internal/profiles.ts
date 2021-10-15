import { Router } from 'express';
import {
  InternalPermissionMiddleware,
  InternalProfileMiddleware,
  PERMISSION,
  Profile,
  RESULT,
  Wrapper,
} from '../..';

export function getInternalProfilesRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.PROFILES_LIST),
    Wrapper(async (req) => {
      const { profiles, total } = await Profile.getProfiles(req.query);
      throw RESULT.SUCCESS({ details: { profiles, total } });
    })
  );

  router.get(
    '/:profileId',
    InternalPermissionMiddleware(PERMISSION.PROFILES_VIEW),
    InternalProfileMiddleware(),
    Wrapper(async (req) => {
      const { profile } = req.internal;
      throw RESULT.SUCCESS({ details: { profile } });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.PROFILES_CREATE),
    Wrapper(async (req) => {
      const { profileId } = await Profile.createProfile(req.body);
      throw RESULT.SUCCESS({ details: { profileId } });
    })
  );

  router.post(
    '/:profileId',
    InternalPermissionMiddleware(PERMISSION.PROFILES_MODIFY),
    InternalProfileMiddleware(),
    Wrapper(async (req) => {
      const { body, internal } = req;
      await Profile.modifyProfile(internal.profile, body);
      throw RESULT.SUCCESS();
    })
  );

  router.delete(
    '/:profileId',
    InternalPermissionMiddleware(PERMISSION.PROFILES_DELETE),
    InternalProfileMiddleware(),
    Wrapper(async (req) => {
      await Profile.deleteProfile(req.internal.profile);
      throw RESULT.SUCCESS();
    })
  );

  return router;
}
