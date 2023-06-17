import { z } from "zod";

export const configSchema = z.object({
  PORT: z.coerce.number().gt(0),
  LOG_LEVEL: z.string().default("info"),
  YLE_APP_ID: z.string().nonempty(),
  YLE_APP_KEY: z.string().nonempty(),
  YLE_API_BASE_URL: z.string().nonempty(),
  YLE_API_DEBOUNCE_MS: z.number().default(300),
  DB_HOST: z.string().nonempty(),
  DB_PORT: z.coerce.number().gt(0),
  DB_USERNAME: z.string().nonempty(),
  DB_PASSWORD: z.string().nonempty(),
  DB_DATABASE: z.string().nonempty(),
  SCHEDULING_ENABLED: z.boolean().default(true),
  FETCH_TELETEXT_SCHEDULE: z.string().default("*/5 * * * *"),
});
export type ConfigSchema = z.infer<typeof configSchema>;
