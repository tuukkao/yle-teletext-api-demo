import cron from "node-cron";
import { config } from "./config";
import { fetchTeletextPages } from "./services/fetchTeletextPages";
import { logger } from "./logger";

export function setupJobs() {
  if (config.SCHEDULING_ENABLED === false) {
    logger.info("Scheduling disabled.");
    return;
  }

  cron.schedule(config.FETCH_TELETEXT_SCHEDULE, () => fetchTeletextPages());
}
