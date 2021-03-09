import Database from './tools/database';
import getRouter from './routes';
import serverless from 'serverless-http';

Database.initPrisma();
const options = { basePath: '/v1/location' };
export const handler = serverless(getRouter(), options);
