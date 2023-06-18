import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `CREATE INDEX teletext_pages_page_subpage_idx ON teletext_pages (page_number, subpage_number)`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX teletext_pages_page_subpage_idx`);
}
