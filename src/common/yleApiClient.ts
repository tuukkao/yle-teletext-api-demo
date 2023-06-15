import axios, { Axios } from "axios";
import { config } from "./config";

export const yleApiClient: Axios = axios.create({
  baseURL: config.YLE_API_BASE_URL,
  params: {
    app_id: config.YLE_APP_ID,
    app_key: config.YLE_APP_KEY,
  },
});
