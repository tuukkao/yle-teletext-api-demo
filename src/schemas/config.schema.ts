import { z } from "zod";

export const configSchema = z.object({
  YLE_APP_ID: z.string().nonempty(),
  YLE_APP_KEY: z.string().nonempty(),
  YLE_API_BASE_URL: z.string().nonempty(),
});
export type ConfigSchema = z.infer<typeof configSchema>;
