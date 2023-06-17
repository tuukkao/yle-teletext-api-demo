import { knexConnection, tables } from "../database";

export interface ImageResponse {
  modifiedDate: Date;
  image: ArrayBuffer;
}

export async function getImage(
  pageNumber: number,
  subpageNumber: number,
  timestamp: Date
): Promise<ImageResponse | undefined> {
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

  if (result === undefined) return undefined;
  return {
    modifiedDate: result.modified_date,
    image: result.image,
  };
}
