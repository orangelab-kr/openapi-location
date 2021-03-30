import InternalPermissionMiddleware, {
  PERMISSION,
} from '../../middlewares/internal/permissions';

import InternalProfileMiddleware from '../../middlewares/internal/profile';
import OPCODE from '../../tools/opcode';
import Profile from '../../controllers/profile';
import { Router } from 'express';
import { Wrapper } from '../../tools';

export default function getInternalProfilesRouter(): Router {
  const router = Router();

  router.get(
    '/',
    InternalPermissionMiddleware(PERMISSION.PROFILES_LIST),
    Wrapper(async (req, res) => {
      const { profiles, total } = await Profile.getProfiles(req.query);
      res.json({ opcode: OPCODE.SUCCESS, profiles, total });
    })
  );

  router.get(
    '/:profileId',
    InternalPermissionMiddleware(PERMISSION.PROFILES_VIEW),
    InternalProfileMiddleware(),
    Wrapper(async (req, res) => {
      const { profile } = req.internal;
      res.json({ opcode: OPCODE.SUCCESS, profile });
    })
  );

  router.post(
    '/',
    InternalPermissionMiddleware(PERMISSION.PROFILES_CREATE),
    Wrapper(async (req, res) => {
      const { profileId } = await Profile.createProfile(req.body);
      res.json({ opcode: OPCODE.SUCCESS, profileId });
    })
  );

  router.post(
    '/:profileId',
    InternalPermissionMiddleware(PERMISSION.PROFILES_MODIFY),
    InternalProfileMiddleware(),
    Wrapper(async (req, res) => {
      const { body, internal } = req;
      await Profile.modifyProfile(internal.profile, body);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  router.delete(
    '/:profileId',
    InternalPermissionMiddleware(PERMISSION.PROFILES_DELETE),
    InternalProfileMiddleware(),
    Wrapper(async (req, res) => {
      await Profile.deleteProfile(req.internal.profile);
      res.json({ opcode: OPCODE.SUCCESS });
    })
  );

  return router;
}
