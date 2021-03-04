import Database from './tools/database';
import dotenv from 'dotenv';
import getRouter from './routes';
import serverless from 'serverless-http';
if (process.env.NODE_ENV === 'development') dotenv.config();

Database.initPrisma();
const options = { basePath: '/v1/location' };
export const handler = serverless(getRouter(), options);
