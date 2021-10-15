import cors from 'cors';
import express from 'express';
import i18n from 'i18n';
import serverless from 'serverless-http';
import {
  getRouter,
  RESULT,
  LoggerMiddleware,
  registerSentry,
  Wrapper,
} from '.';

export * from './controllers';
export * from './middlewares';
export * from './routes';
export * from './tools';

const app = express();
registerSentry(app);

app.use(cors());
app.use(i18n.init);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(LoggerMiddleware());
app.use('/', getRouter());
app.all(
  '*',
  Wrapper(async () => {
    throw RESULT.INVALID_API();
  })
);

const options = { basePath: '/v1/location' };
export const handler = serverless(app, options);
