import { AxiosError } from "axios";
import { range } from "lodash";
import { yleApiClient } from "../../common/yleApiClient";
import {
  TeletextPage,
  teletextPageSchema,
} from "../../schemas/teletextPage.schema";
import { knexConnection, tables } from "../database";
/* eslint-disable @typescript-eslint/no-var-requires */
const allPages: number[] = require("../../../resources/pages.json");

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
): Promise<TeletextPageResponse | undefined> {
  // There are some pages that exist in the official listing but are in fact missing. Just log a message in that case.
  try {
    const response = await yleApiClient.get(
      `/v1/teletext/pages/${pageNumber}.json`
    );
    const lastModifiedDate = response.headers["last-modified"];

    return {
      modifiedDate: lastModifiedDate && new Date(lastModifiedDate),
      page: teletextPageSchema.parse(response.data),
    };
  } catch (error) {
    if (
      error instanceof AxiosError &&
      error.response &&
      error.response.status === 404
    ) {
      console.log(`Page number ${pageNumber} doesn't exist.`);
      return undefined;
    }
  }
}

async function getTeletextPageImage(
  pageNumber: number,
  subpageNumber: number
): Promise<ArrayBuffer> {
  const response = await yleApiClient.get(
    `/v1/teletext/images/${pageNumber}/${subpageNumber}.png`,
    {
      responseType: "arraybuffer",
    }
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
    .orderBy([
      {
        column: "modified_date",
        order: "desc",
      },
    ])
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
  await knexConnection
    .insert({
      page_number: data.pageNumber,
      subpage_number: data.subpageNumber,
      modified_date: data.modifiedDate,
      image: data.image,
    })
    .into(tables.teletextPages);
  console.log("operatio ndone");
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
  console.log("getting teletext image");
  const image = await getTeletextPageImage(pageNumber, subpageNumber);
  console.log("got image");
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
    console.log(`fetching subpage ${subpageNumber}`);
    const pageNumber = parseInt(page.teletext.page.number);
    await saveImageForSubpage(pageNumber, subpageNumber, modifiedDate);
    console.log("image saved");
  }
}

async function saveImagesForPage(pageNumber: number) {
  console.log("Fetching page " + pageNumber);
  const pageResponse = await getTeletextPageData(pageNumber);

  if (pageResponse === undefined) return;

  const { modifiedDate, page } = pageResponse;

  if (await isNewerPage(pageNumber, modifiedDate)) {
    await saveImagesForSubpages(page, modifiedDate);
  }
}

async function fetchTeletextPages() {
  await Promise.all(
    allPages.map(async (pageNumber) => await saveImagesForPage(pageNumber))
  );
}

// Used for temporary standalone testing
async function main() {
  await fetchTeletextPages();
  await knexConnection.destroy();
}

main();
