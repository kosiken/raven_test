require('dotenv').config();
import {appConfig} from '../src/config';

import { AppServer } from '../src/app-server';
import * as user from '../src/routes/users';
import * as bankAccount from '../src/routes/bankAccounts';
import * as transaction from '../src/routes/transactions';

import { IConfig } from '../src/config/interface';


export let server: AppServer;

function setServer(config: Partial<IConfig>, appServer?: AppServer) {
    const app = new AppServer({
        controllers: [user, bankAccount, transaction]
    }, appConfig.withOverride(config))

    appServer = app;
    server = app;

    return app.startUpServer();
}
export default setServer;