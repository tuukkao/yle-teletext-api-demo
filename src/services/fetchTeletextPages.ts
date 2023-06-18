import { range } from "lodash";
import yleApiClient from "../client/yleApiClient";
import { config } from "../config";
import { knexConnection, tables } from "../database";
import { logger } from "../logger";
import {
  TeletextPage,
  teletextPageSchema,
} from "../schemas/teletextPage.schema";

interface TeletextPageResponse {
  modifiedDate: Date;
  page: TeletextPage;
}

interface savePageData {
  pageNumber: number;
  subpageNumber: number;
  modifiedDate: Date;
  image: ArrayBuffer;
}

// TODO: Api calls lack any kind of debouncing. Implement just in case we're hitting them too hard.

async function getTeletextPageData(
  pageNumber: number
): Promise<TeletextPageResponse> {
  const response = await yleApiClient.teletext.pages(pageNumber);
  const lastModifiedDate = response.headers["last-modified"];

  return {
    modifiedDate: new Date(lastModifiedDate),
    page: teletextPageSchema.parse(response.data),
  };
}

async function getTeletextPageImage(
  pageNumber: number,
  subpageNumber: number
): Promise<ArrayBuffer> {
  logger.debug(
    `Getting image for page ${pageNumber}, subpage ${subpageNumber}`
  );
  const response = await yleApiClient.teletext.images(
    pageNumber,
    subpageNumber
  );

  return response.data;
}

async function getlatestDateForPage(
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

async function isNewerPage(
  pageNumber: number,
  modifiedDate: Date
): Promise<boolean> {
  const dbModifiedDate = await getlatestDateForPage(pageNumber);
  return dbModifiedDate === undefined || modifiedDate > dbModifiedDate;
}

async function saveImage(data: savePageData): Promise<void> {
  logger.debug(
    `Saving image for page ${data.pageNumber}, subpage ${data.subpageNumber}`
  );
  await knexConnection
    .insert({
      page_number: data.pageNumber,
      subpage_number: data.subpageNumber,
      modified_date: data.modifiedDate,
      image: data.image,
    })
    .into(tables.teletextPages);
}

function subpageNumbersForPage(page: TeletextPage): number[] {
  const subpageCount = parseInt(page.teletext.page.subpagecount);
  return subpageCount === 1 ? [1] : range(1, subpageCount + 1);
}

async function saveImageForSubpage(
  pageNumber: number,
  subpageNumber: number,
  modifiedDate: Date
): Promise<void> {
  const image = await getTeletextPageImage(pageNumber, subpageNumber);
  await saveImage({
    pageNumber,
    subpageNumber,
    modifiedDate,
    image,
  });
}

async function saveImagesForSubpages(
  page: TeletextPage,
  modifiedDate: Date
): Promise<void> {
  for (const subpageNumber of subpageNumbersForPage(page)) {
    logger.debug(`started processing subpage ${subpageNumber}`);
    const pageNumber = parseInt(page.teletext.page.number);
    await saveImageForSubpage(pageNumber, subpageNumber, modifiedDate);
    logger.debug(`Subpage ${subpageNumber} processed`);
  }
}

async function processPage(pageNumber: number): Promise<TeletextPage> {
  logger.debug(`Started processing page ${pageNumber}`);
  const { modifiedDate, page } = await getTeletextPageData(pageNumber);

  if (await isNewerPage(pageNumber, modifiedDate)) {
    await saveImagesForSubpages(page, modifiedDate);
  } else {
    logger.debug(`page ${pageNumber} already has the latest copy, skipping.`);
  }

  return page;
}

export async function fetchTeletextPages() {
  async function getPage(pageNumber: number) {
    const page = await processPage(pageNumber);

    if (page.teletext.page.nextpg !== undefined)
      await getPage(parseInt(page.teletext.page.nextpg));
  }

  logger.info("Starting Teletext page import");
  await getPage(config.TELETEXT_FIRST_PAGE);
  logger.info("Teletext page import finished");
}
