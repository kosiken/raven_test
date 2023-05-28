/* tslint:disable:no-var-requires */
require('dotenv').config();

import { IConfig } from './interface';

export const defaultConfig: IConfig = {
  raveSecret: process.env.RAVE_SECRET!,
  serverPort: process.env.SERVER_PORT!,
  testBalance: process.env.TEST_DEFAULT_BALANCE!,
  env: process.env.NODE_ENV!,
  version: '1.0.0',
  db: {
    user: process.env.DB_USER!,
    port: process.env.DB_PORT!,
    dbName: process.env.DB_NAME!,
    dbHost: process.env.DB_HOST!,
    password: process.env.DB_PASSWORD!,
  },
  secrets: {
    jwtSecret: process.env.JWT_SECRET!,
  }
 };
