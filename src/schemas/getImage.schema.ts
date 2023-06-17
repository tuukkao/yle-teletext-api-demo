import { z } from "zod";

export const getImageParamsSchema = z.object({
  pageNumber: z.coerce.number(),
  subpageNumber: z.coerce.number(),
});

export const getImageQuerySchema = z.object({
  time: z.coerce.number(),
});
