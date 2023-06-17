import { knexConnection, tables } from "../database";

async function getImage(
  pageNumber: number,
  subpageNumber: number,
  timestamp: Date
): Promise<ArrayBuffer> {
  const result = await knexConnection
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

  return result?.image;
}
