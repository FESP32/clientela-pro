
import { z } from "zod";

export const SurveyFromFormSchema = z.object({
  product_id: z.string().uuid({ message: "Select a product." }),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  is_active: z
    .preprocess(
      (v) => v === "on" || v === "true" || v === true || v === 1 || v === "1",
      z.boolean()
    )
    .optional(),
  is_anonymous: z
    .preprocess(
      (v) => v === "on" || v === "true" || v === true || v === 1 || v === "1",
      z.boolean()
    )
    .default(false),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
  // original textarea fields (still supported as fallback)
  traits_1: z.string().optional().default(""),
  traits_2: z.string().optional().default(""),
  traits_3: z.string().optional().default(""),
  traits_4: z.string().optional().default(""),
  traits_5: z.string().optional().default(""),
});
