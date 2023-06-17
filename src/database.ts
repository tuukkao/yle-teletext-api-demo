import * as knexConfig from "../knexfile";
import knex from "knex";

export const knexConnection = knex(knexConfig);

export const tables = {
  teletextPages: "teletext_pages",
};
