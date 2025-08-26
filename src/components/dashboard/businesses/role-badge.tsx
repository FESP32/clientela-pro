"use client";

import { Badge } from "@/components/ui/badge";

export default function RoleBadge({ role }: { role: string }) {
  if (!role) return <Badge variant="outline">unknown</Badge>;
  if (role === "owner") return <Badge>owner</Badge>;
  if (role === "admin") return <Badge variant="secondary">admin</Badge>;
  return <Badge variant="outline">member</Badge>;
}