import express from "express";
import { config } from "./config";
import routes from "./routes";
import { logger } from "./logger";
import { setupJobs } from "./jobs";

const app = express();
app.use("/v1", routes);
setupJobs();

app.listen(config.PORT, () => {
  logger.info(`Listening on port ${config.PORT}`);
});
