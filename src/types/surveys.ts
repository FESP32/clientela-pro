export type Sentiment = "positive" | "neutral" | "negative";
export type Trait = { label: string; sentiment?: Sentiment; score?: number };

export type SurveyRow = {
  id: string;
  owner_id: string;
  product_id: string;
  title: string;
  description: string | null;
  traits:
    | Array<{
        label: string;
        sentiment?: "positive" | "neutral" | "negative";
        score?: number;
      }>
    | [];
  is_active: boolean;
  is_anonymous: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  product_name?: string;
  traits_count?: number;
};

export type ResponseRow = {
  id: string;
  survey_id: string;
  respondent_id: string | null;
  rating: number;
  respondent?: {
    name: string;
  };
  selected_traits: string[];
  comment: string | null;
  submitted_at: string;
};

export type SurveyRecord = {
  id: string;
  title: string;
  description: string | null;
  is_anonymous: boolean;
  traits: Array<{
    label: string;
    sentiment?: "positive" | "neutral" | "negative";
    score?: number;
  }>;
};
