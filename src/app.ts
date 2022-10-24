require('dotenv').config();
import {appConfig} from './config';

import { AppServer } from './app-server';
import * as user from './routes/users';
import * as bankAccount from './routes/bankAccounts';
import * as transaction from '../src/routes/transactions';

import Logger from './utils/Logger';

const app = new AppServer({
    controllers: [user, bankAccount, transaction]
}, appConfig.default)

app.Server()?.on('close', () => {
    app.closeDb();
})
app.startUpServer()
.then(() => {

    Logger.log(`listening on port ${8080}`)


})
.catch(err => {
    console.error(err);
    console.log('tea')
})

