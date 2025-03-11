import { z } from "zod";

export const RequestPayloadSchema = z.object({
  q: z.string().optional(),
  isbn: z.string().optional()
});

export type RequestPayload = z.infer<typeof RequestPayloadSchema>;
