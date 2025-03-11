import { z } from "zod";

export const SearchParamsSchema = z.object({
  q: z.string().optional(),
  isbn: z.string().optional()
});

export const BrowseParamsSchema = z.object({
  id: z.string()
});