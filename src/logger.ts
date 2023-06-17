import { createLogger, format, transports } from "winston";
import { config } from "./config";

export const logger = createLogger({
  level: config.LOG_LEVEL,
  transports: [
    new transports.Console({
      format: format.cli(),
    }),
  ],
});
