import "dotenv/config";
import { ConfigSchema, configSchema } from "./schemas/config.schema";

export const config: ConfigSchema = configSchema.parse(process.env);
