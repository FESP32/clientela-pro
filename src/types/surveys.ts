import { Inserts, Tables, Updates } from "@/utils/supabase/helpers";
import { ProductRow } from "./products";

export type SurveyRow = Tables<"surveys">;
export type SurveyInsert = Inserts<"surveys">;
export type SurveyUpdate = Updates<"surveys">;

export type ResponseRow = Tables<"responses">;
export type ResponseInsert = Inserts<"responses">;
export type ResponseUpdate = Updates<"responses">;

export type LatestSurvey = Pick<SurveyRow, "id" | "title" | "created_at">;

export type Sentiment = "positive" | "neutral" | "negative";
export type Trait = { label: string; sentiment?: Sentiment; score?: number };

export type SurveyRowWithTraits = Omit<SurveyRow, "traits"> & {
  traits: Trait[] | null; // matches DB nullability; treat null as []
};

export type ResponseWithSurveyTraits = Omit<
  ResponseRow,
  "selected_traits"
> & {
  traits: Trait[] | null; // keep nullability from DB
};

export type ResponseListItem = Pick<
  ResponseRow,
  | "id"
  | "survey_id"
  | "respondent_id"
  | "rating"
  | "selected_traits"
  | "comment"
  | "submitted_at"
> & {
  respondent_name: string;
};

export type ResponseWithRespondent = Pick<
  ResponseRow,
  | "id"
  | "survey_id"
  | "respondent_id"
  | "rating"
  | "selected_traits"
  | "comment"
  | "submitted_at"
> & {
  respondent?: { name: string | null } | null;
};

export type SurveyWithProduct = Pick<
  SurveyRow,
  | "id"
  | "owner_id"
  | "product_id"
  | "title"
  | "description"
  | "is_anonymous"
  | "traits"
  | "is_active"
  | "starts_at"
  | "ends_at"
  | "created_at"
  | "updated_at"
> & {
  products: Pick<ProductRow, "name"> | null;
};

export type SurveyListItem = Pick<
  SurveyRow,
  | "id"
  | "owner_id"
  | "product_id"
  | "title"
  | "description"
  | "is_anonymous"
  | "traits"
  | "is_active"
  | "starts_at"
  | "ends_at"
  | "created_at"
  | "updated_at"
> & {
  product_name: string;
  traits_count: number;
};
