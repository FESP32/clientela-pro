// app/dashboard/businesses/page.tsx
import { listMyBusinesses, setActiveBusiness } from "@/actions";
import type { BusinessWithMembership } from "@/types";
import MerchantListSection from "@/components/common/merchant-list-section";
import BusinessesExplorer from "@/components/dashboard/businesses/business-explorer";
import { Badge } from "@/components/ui/badge";
import { Building2, CheckCircle2, ShieldCheck, Store } from "lucide-react";
import MonoIcon from "@/components/common/mono-icon";

export const dynamic = "force-dynamic";

export default async function BusinessesPage() {
  const { data = [] } = await listMyBusinesses();
  const items = data as BusinessWithMembership[];

  const total = items.length;
  const active = items.filter((b) => Boolean(b.is_active)).length;
  const managed = items.filter((b) => {
    const role = b.membership?.[0]?.role ?? "";
    return role === "owner" || role === "admin";
  }).length;

  return (
    <MerchantListSection
      title={
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <MonoIcon>
              <Store
                className="size-4"
                aria-hidden="true"
              />
            </MonoIcon>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Your businesses
            </h1>
          </div>

          {/* Badges (same pattern as Gifts page) */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {total} total
            </Badge>
            <Badge className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {active} active
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              {managed} managed
            </Badge>
          </div>
        </div>
      }
      subtitle={
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          Search, filter, and switch your current business context.
        </div>
      }
      headerClassName="mb-4"
      contentClassName="space-y-4"
    >
      {/* Hairline divider for subtle structure */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

      <BusinessesExplorer items={items} setActiveAction={setActiveBusiness} />
    </MerchantListSection>
  );
}
