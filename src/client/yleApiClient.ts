import axios, { Axios, AxiosResponse } from "axios";
import { config } from "../config";
import { TeletextPage } from "../schemas/teletextPage.schema";

const yleApiClient: Axios = axios.create({
  baseURL: config.YLE_API_BASE_URL,
  params: {
    app_id: config.YLE_APP_ID,
    app_key: config.YLE_APP_KEY,
  },
});

export default {
  teletext: {
    images: async (
      pageNumber: number,
      subpageNumber: number
    ): Promise<AxiosResponse<ArrayBuffer>> =>
      await yleApiClient.get(
        `/v1/teletext/images/${pageNumber}/${subpageNumber}.png`,
        { responseType: "arraybuffer" }
      ),
    pages: async (pageNumber: number): Promise<AxiosResponse<TeletextPage>> =>
      await yleApiClient.get(`/v1/teletext/pages/${pageNumber}.json`),
  },
};
