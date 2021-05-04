import express, { Application } from 'express';

import Geofence from '../controllers/geofence';
import InternalError from '../tools/error';
import InternalMiddleware from '../middlewares/internal';
import OPCODE from '../tools/opcode';
import { PlatformMiddleware } from '../middlewares';
import Wrapper from '../tools/wrapper';
import cors from 'cors';
import getInternalRouter from './internal';
import getRegionRouter from './regions';
import logger from '../tools/logger';
import morgan from 'morgan';
import os from 'os';

export default function getRouter(): Application {
  const router = express();
  const hostname = os.hostname();
  const logging = morgan('common', {
    stream: { write: (str: string) => logger.info(`${str.trim()}`) },
  });

  router.use(cors());
  router.use(logging);
  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));
  router.use('/internal', InternalMiddleware(), getInternalRouter());
  router.use('/regions', PlatformMiddleware(), getRegionRouter());
  router.get(
    '/geofences',
    PlatformMiddleware(),
    Wrapper(async (req, res) => {
      const geofence = await Geofence.getGeofenceByLocation(req.query);
      res.json({ opcode: OPCODE.SUCCESS, geofence });
    })
  );

  router.get(
    '/',
    Wrapper(async (_req, res) => {
      res.json({
        opcode: OPCODE.SUCCESS,
        name: process.env.AWS_LAMBDA_FUNCTION_NAME,
        mode: process.env.NODE_ENV,
        cluster: hostname,
      });
    })
  );

  router.all(
    '*',
    Wrapper(async () => {
      throw new InternalError('Invalid API', OPCODE.NOT_FOUND);
    })
  );

  return router;
}
