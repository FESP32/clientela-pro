export type ProductRow = {
  id: string;
  owner_id: string;
  name: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};