import { Inserts, Tables, Updates } from "@/utils/supabase/helpers";
import { ProductRow } from "./products";
import { ProfileRow } from "./auth";

export type SurveyRow = Tables<"survey">;
export type SurveyInsert = Inserts<"survey">;
export type SurveyUpdate = Updates<"survey">;

export type ResponseRow = Tables<"response">;
export type ResponseInsert = Inserts<"response">;
export type ResponseUpdate = Updates<"response">;

export type ResponseWithRespondent = Pick<
  ResponseRow,
  "id" | "rating" | "comment" | "submitted_at"
> & {
  selected_traits: ReadonlyArray<string>;
  respondent: Pick<ProfileRow, "user_id" | "name"> | null;
};

/* Nested shape: survey with its responses */
export type SurveyWithResponses = Pick<
  SurveyRow,
  | "id"
  | "title"
  | "description"
  | "is_anonymous"
  | "is_active"
  | "starts_at"
  | "ends_at"
  | "created_at"
> & {
  responses: ResponseWithRespondent[];
};

export type SurveyWithProduct = Pick<
  SurveyRow,
  | "id"
  | "title"
  | "description"
  | "is_active"
  | "is_anonymous"
  | "starts_at"
  | "ends_at"
  | "created_at"
  | "business_id"
  | "product_id"
> & {
  product: Pick<ProductRow, "id" | "name"> | null;
};

export type ResponseWithSurvey = Pick<
  ResponseRow,
  "id" | "rating" | "comment" | "submitted_at"
> & {
  selected_traits: ReadonlyArray<string>; // <- readonly fixes the mismatch
  survey: Pick<SurveyRow, "title"> | null;
};

export type Sentiment = "positive" | "neutral" | "negative";

export type Trait = {
  /** Short human label, e.g. "Fast delivery" */
  label: string;
  /** Optional sentiment tag */
  sentiment?: Sentiment;
  /** Optional numeric score (your scale, e.g. 0–1 or 0–100) */
  score?: number;
};

export type SurveyWithTraits = Omit<SurveyRow, "traits"> & {
  traits: ReadonlyArray<Trait>;
};