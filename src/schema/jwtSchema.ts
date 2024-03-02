import { z } from "zod";

export const refreshSchema = z.object({
  id: z.string(),
  userId: z.number(),
  iat: z.number(),
});
