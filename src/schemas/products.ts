import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  metadata: z
    .string()
    .transform((s) => s.trim())
    .transform((s) => (s ? JSON.parse(s) : {}))
    .refine((v) => v && typeof v === "object" && !Array.isArray(v), {
      message: "Metadata must be a JSON object",
    }),
});
