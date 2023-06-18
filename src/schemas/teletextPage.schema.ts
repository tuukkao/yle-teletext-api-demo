import { z } from "zod";

// This schema has been adapted from page 199 of the Teletext api.
// It contains only the fields we're interested in.

export const teletextSubpageItemSchema = z.object({
  type: z.string(),
  line: z.array(
    z.object({
      number: z.string(),
      Text: z.string().optional(),
    })
  ),
});
const teletextSubpageSchema = z.object({
  number: z.string(),
  time: z.string(),
  content: z.array(teletextSubpageItemSchema),
});
export const teletextPageSchema = z.object({
  teletext: z.object({
    network: z.string(),
    xml: z.string(),
    page: z.object({
      number: z.string(),
      prevpg: z.string().optional(),
      nextpg: z.string().optional(),
      subpagecount: z.string(),
      subpage: z.array(teletextSubpageSchema),
    }),
  }),
});

export type TeletextSubpageItem = z.infer<typeof teletextSubpageItemSchema>;
export type TeletextSubpage = z.infer<typeof teletextSubpageSchema>;
export type TeletextPage = z.infer<typeof teletextPageSchema>;
