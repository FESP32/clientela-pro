// app/services/referrals/referred/page.tsx  (adjust path if needed)
import { redirect } from "next/navigation";
import { listMyReferredIntents } from "@/actions";
import CustomerListSection from "@/components/dashboard/common/customer-list-section";
import ReferredIntentsResponsive from "@/components/services/referrals/referred-intents-table";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReferredIntentsListPage() {
  const { user, items, error } = await listMyReferredIntents();
  if (!user) redirect("/login?next=/services/referrals/referred");

  if (error) {
    return (
      <CustomerListSection
        kicker="Referrals"
        title="Your joined invites"
        subtitle="There was a problem loading your invites."
        divider
      >
        <p className="text-sm text-destructive">{error}</p>
      </CustomerListSection>
    );
  }

  const total = items.length;
  const pending = items.filter((i) => i.status === "pending").length;
  const consumed = items.filter((i) => i.status === "consumed").length;

  return (
    <CustomerListSection
      kicker="Referrals"
      title="Your joined invites"
      subtitle="Invites you’ve accepted or used."
      divider
      actions={
        total > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary" className="gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {total} total
            </Badge>
            <Badge className="gap-1.5">{consumed} consumed</Badge>
            <Badge variant="outline" className="gap-1.5">
              {pending} pending
            </Badge>
          </div>
        ) : null
      }
      contentClassName="pt-2"
    >
      <ReferredIntentsResponsive items={items} />
    </CustomerListSection>
  );
}
