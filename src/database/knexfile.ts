require('dotenv').config();
import type { Knex } from "knex";


// Update with your config settings.
import { appConfig } from "../config";

const config = appConfig.default;

const knexConfig: { [key: string]: Knex.Config } = {
  
  development: {
    client: "mysql2",
    connection: {
      host: config.db.dbHost,
      port: parseInt(config.db.port, 10),
      user: config.db.user,
      password: config.db.password,
      database: config.db.dbName,
    },
  },
};

module.exports = knexConfig;
