export type StampCardRow = {
  id: string;
  owner_id: string;
  title: string;
  goal_text: string;
  stamps_required: number;
  is_active: boolean;
  valid_from: string | null;
  valid_to: string | null;
  created_at: string;
  updated_at: string;
  product_count?: number;
};

export type StampIntentRow = {
  id: string;
  card_id: string;
  merchant_id: string;
  customer_id: string | null;
  qty: number;
  status: "pending" | "consumed" | "canceled";
  note: string | null;
  expires_at: string | null;
  consumed_at: string | null;
  created_at: string;
  updated_at: string;
  customer_name?: string | null; // from profiles (if present)
};
