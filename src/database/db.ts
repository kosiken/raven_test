import { IConfig } from '../config/interface'
import logger from '../utils/Logger';
import knex, { Knex } from 'knex';
import * as path from 'path'
import Logger from '../utils/Logger';

export class Database {

  public static getInstance(): Database {
    return Database.instance;
  }

  private static instance: Database = new Database();
  public db?: Knex;
  private isSet: boolean;
  constructor() {
    if (Database.instance) {
      logger.logLevel.err('Error: Instantiation failed: Use Database.getInstance() instead of new.');
    }

    this.isSet = false;

    Database.instance = this;
  }

  public async setupDb(config: IConfig) {
    if(this.isSet) return;

    this.db = knex(
        {
            client: 'mysql2',
            connection: {host : config.db.dbHost,
            port : parseInt(config.db.port, 10),
            user : config.db.user,
            password :  config.db.password,
            database : config.db.dbName
        }
        }
    )
      const migrations = path.join(__dirname, 'migrations');
      Logger.log(migrations + ' ' + path.join(__dirname, 'migrations'));
     
    const m = await  this.db.migrate.latest({
      directory: path.join(__dirname, 'migrations')
    })
    Logger.log('migrations ' + m);
    this.isSet = true;


  }

  public async closeDb() {
    if(this.isSet) {
       await this.db!.destroy();
       this.isSet= false;
      }
  }

}
