import { z } from "zod";

export const ReferralProgramFromFormSchema = z.object({
  title: z.string().min(2, "Title is too short"),
  code: z
    .string()
    .min(2, "Code is too short")
    .regex(
      /^[A-Za-z0-9._-]+$/,
      "Use letters, numbers, dot, dash or underscore"
    ),
  is_active: z
    .union([
      z.literal("on"),
      z.literal("true"),
      z.literal("false"),
      z.boolean(),
    ])
    .optional()
    .transform((v) =>
      v === "on" || v === "true" || v === true ? true : false
    ),
  referrer_reward: z.string().optional().nullable(),
  referred_reward: z.string().optional().nullable(),
  valid_from: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : null)),
  valid_to: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : null)),
  // empty string => null (unlimited); otherwise number >= 1
  per_referrer_cap: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === null || v === "") return null;
      const n = typeof v === "string" ? Number(v) : v;
      return Number.isFinite(n) ? n : null;
    })
    .refine((v) => v === null || (typeof v === "number" && v >= 1), {
      message: "Per-referrer cap must be empty (unlimited) or ≥ 1",
    }),
});
