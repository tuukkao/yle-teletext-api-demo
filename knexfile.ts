import type { Knex } from "knex";
import { config } from "./src/common/config";

const knexConfig: Knex.Config = {
  client: "postgresql",
  connection: {
    host: config.DB_HOST,
    port: config.DB_PORT,
    database: config.DB_DATABASE,
    user: config.DB_USERNAME,
    password: config.Db_PASSWORD,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: "knex_migrations",
    extension: "ts",
  },
};

module.exports = knexConfig;
