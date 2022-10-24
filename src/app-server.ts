import { ErrorCallback, retry } from 'async';
import * as compression from 'compression';
import * as cors from 'cors';
import * as express from 'express';
import { Application } from 'express';
import * as fs from 'fs';
import { Server } from 'http';

import { IConfig } from './config/interface';
import database from './database';
import { Database } from './database/db';
import { serverErrorHandler, notFoundHandler } from './middlewares';
import {  requestLogger } from './middlewares';
import {factory} from './middlewares/auth/passport'
import Logger from './utils/Logger';

const middlewares = [
  cors(),
  compression(),
  express.json(),
  express.urlencoded({ extended: true }),
//   express.static('./public'),
//   express.static('./public/css'),
  // passport.initialize(),
  // passport.session(),
  requestLogger,
];

export class AppServer {
  public app: Application;

  public port: number;
  public server: Server | undefined;
  public db: Database;
  public state = false;
  constructor(appInit: {
    controllers: any,
  }, private config: IConfig) {
    factory(config);
    this.app = express();
    this.port = parseInt(this.config.serverPort);


    this.middlewares(middlewares);
    this.routes(appInit.controllers);
    this.db = database;

    this.app.use(notFoundHandler);
    this.app.use(serverErrorHandler);
  }

  public App() {
    return this.app;
  }

  public Server() {
    return this.server;
  }

  public async listen(): Promise<Server> {

    this.server = this.app.listen(this.port);
    return this.server;
  }


  private middlewares(middleWares: {
    forEach: (arg0: (middleWare: any) => void) => void;
  }) {
    middleWares.forEach((middleWare) => {
      this.app.use(middleWare);
    });
  }


  private routes(controllers: any) {
    controllers.forEach((controller: any) => {
      controller.init(this.app, this.config);
    });

  }

  public setupDBConnections() {
   
    this.db = database;
   return this.db.setupDb(this.config);
  }
  public closeDb() {
    return this.db.closeDb()
  }

  public async startUpServer() {
    
    await this.setupDBConnections();
    this.state = true;
    return this.listen();
   
  }

  public stopServer () {
    return  new Promise<string>((res, rej) => {
      this.server!.close(err => {
        if(err) {
          rej(err.message);

        }
        res('done');
      })
    })
  }

  public async stop() {
    await this.closeDb();
    await this.stopServer();
    Logger.log('stopped')
    this.state = false;
  }

}
