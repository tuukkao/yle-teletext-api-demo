import express from "express";
import { config } from "./config";
import routes from "./routes";
import { logger } from "./logger";

const app = express();
app.use("/v1", routes);
app.listen(config.PORT, () => {
  logger.info(`Listening on port ${config.PORT}`);
});
