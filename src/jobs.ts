import cron from "node-cron";
import { config } from "./config";
import { fetchTeletextPages } from "./services/fetchTeletextPages";

export function setupJobs() {
  if (config.SCHEDULING_ENABLED === false) return;

  cron.schedule(config.FETCH_TELETEXT_SCHEDULE, () => fetchTeletextPages());
}
