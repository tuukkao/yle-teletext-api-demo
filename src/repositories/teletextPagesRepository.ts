import { knexConnection, tables } from "../database";

export interface TeletextPageFields {
  page_number: number;
  subpage_number: number;
  image: ArrayBuffer;
  modified_date: Date;
}

export async function getLatestForTimestamp(
  pageNumber: number,
  subpageNumber: number,
  timestamp: Date
): Promise<TeletextPageFields> {
  return await knexConnection
    .select("image", "modified_date")
    .from(tables.teletextPages)
    .where({
      page_number: pageNumber,
      subpage_number: subpageNumber,
    })
    .andWhere("modified_date", "<=", timestamp)
    .orderBy("modified_date", "desc")
    .limit(1)
    .first();
}

export async function getlatestDateForPage(
  pageNumber: number
): Promise<Date | undefined> {
  const dateRow = await knexConnection
    .select("modified_date")
    .from(tables.teletextPages)
    // A page's subpages are all updated at the same time so querying by page id is enough
    .where({
      page_number: pageNumber,
    })
    .orderBy("modified_date", "desc")
    .limit(1)
    .first();

  return dateRow?.modified_date;
}

export async function createTeletextPage(
  data: TeletextPageFields
): Promise<void> {
  const { page_number, subpage_number, image, modified_date } = data;
  await knexConnection
    .insert({
      page_number,
      subpage_number,
      modified_date,
      image,
    })
    .into(tables.teletextPages);
}
