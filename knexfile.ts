import "dotenv/config";
import type { Knex } from "knex";

const knexConfig: Knex.Config = {
  client: "postgresql",
  connection: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || ""),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
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
