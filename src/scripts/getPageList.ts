import { yleApiClient } from "../common/yleApiClient";
import {
  TeletextPage,
  teletextPageSchema,
} from "../schemas/teletextPage.schema";
import { writeFile } from "fs/promises";
import { range } from "lodash";

const pageListPath = process.cwd() + "/resources/pages.json";
const directoryPageNumber = "199";
// Explanation: This matches any 3-digit number as well as number ranges (e.g. 123-125) anywhere in the text.
const pageNumberRegEx = /(\d{3}(?:-\d{3})?)/g;

function parsePageNumbers(lineContents: string): number[] {
  const matchedNumbers = lineContents.match(pageNumberRegEx);
  return (
    matchedNumbers?.flatMap((text) => {
      return isPageRange(text) ? extractPageRange(text) : [parseInt(text)];
    }) || []
  );
}

function isPageRange(text: string): boolean {
  return text.includes("-");
}

function extractPageRange(pageRange: string): number[] {
  const [start, end] = pageRange.split("-");
  return range(parseInt(start), parseInt(end) + 1);
}

function getPageNumbersFromPage(page: TeletextPage): Set<number> {
  // The directory page itself is not mentioned in the data so add it manually
  return [
    199,
    ...page.teletext.page.subpage
      .flatMap((subpage) => subpage.content)
      .filter((contentItem) => contentItem.type === "text")
      .flatMap((contentItem) => contentItem.line)
      .map((line) => line.Text)
      .filter((text) => text !== undefined)
      .flatMap((text) => parsePageNumbers(text as string)),
  ].reduce((acc, current) => {
    acc.add(current);
    return acc;
  }, new Set<number>());
}

async function main() {
  const pageResponse = await yleApiClient.get(
    `v1/teletext/pages/${directoryPageNumber}.json`
  );
  const teletextPage = teletextPageSchema.parse(pageResponse.data);
  const pageNumbers = getPageNumbersFromPage(teletextPage);
  await writeFile(pageListPath, JSON.stringify(Array.from(pageNumbers)));
}

main();
