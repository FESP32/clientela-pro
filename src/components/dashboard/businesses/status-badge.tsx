"use client";

import { Badge } from "@/components/ui/badge";

export function StatusBadge({
  active,
}: {
  active: boolean | null | undefined;
}) {
  return active ? (
    <Badge className="bg-emerald-600 hover:bg-emerald-600">active</Badge>
  ) : (
    <Badge variant="outline">inactive</Badge>
  );
}
