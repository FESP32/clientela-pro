import { Inserts, Tables, Updates } from "@/utils/supabase/helpers";
import { ProfileRow } from "./auth";
import { BusinessRow } from "./business";

export type GiftRow = Tables<"gift">;
export type GiftInsert = Inserts<"gift">;
export type GiftUpdate = Updates<"gift">;


export type GiftIntentRow = Tables<"gift_intent">;
export type GiftIntentInsert = Inserts<"gift_intent">;
export type GiftIntentUpdate = Updates<"gift_intent">;

export type GiftWithBusiness = Pick<
  GiftRow,
  "id" | "title" | "description" | "image_url"
> & {
  business: Pick<BusinessRow, "id" | "name" | "image_url"> | null;
};

export type GiftIntentStatus = "pending" | "consumed" | "canceled" | "claimed";


export type GiftIntentView = Omit<GiftIntentRow, "status"> & {
  status: GiftIntentStatus;
  gift: GiftWithBusiness | null;
  customer: Pick<ProfileRow, "user_id" | "name"> | null;
};

export type GiftIntentDashboardView = Tables<"gift_intent"> & {
  gift: Pick<
    Tables<"gift">,
    "id" | "title" | "description" | "image_url"
  > | null;
  business: Pick<
    Tables<"business">,
    "id" | "name" | "image_url" | "owner_id"
  > | null;
  customer: Pick<Tables<"profile">, "user_id" | "name"> | null;
};

type GiftIntentCore = Pick<
  Tables<"gift_intent">,
  "id" | "status" | "expires_at" | "consumed_at" | "created_at" | "gift_id"
>;

type GiftCore = Pick<
  Tables<"gift">,
  "id" | "title" | "description" | "image_url"
>;

type BusinessCore = Pick<Tables<"business">, "id" | "name" | "image_url">;

export type GiftIntentListItem = GiftIntentCore & {
  gift: (GiftCore & { business: BusinessCore | null }) | null;
};
