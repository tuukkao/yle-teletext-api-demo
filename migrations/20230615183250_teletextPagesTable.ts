import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  CREATE TABLE teletext_pages (
    id BIGSERIAL PRIMARY KEY,
    page_number INTEGER NOT NULL,
    subpage_number INTEGER NOT NULL,
    modified_date TIMESTAMP NOT NULL,
    image BYTEA NOT NULL
  );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE teletext_pages`);
}
