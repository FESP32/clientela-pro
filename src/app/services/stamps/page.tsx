// components/services/stamps/my-stamp-punches.tsx (server)
import { listMyStampPunchesGroupedInCode } from "@/actions";
import CustomerListSection from "@/components/dashboard/common/customer-list-section";
import StampPunchesResponsive from "@/components/services/stamps/stamp-punch-table";
import { Badge } from "@/components/ui/badge";
import { Ticket, CheckCircle2 } from "lucide-react";

export default async function MyStampPunches() {
  const items = await listMyStampPunchesGroupedInCode();

  const cardsCount = items.length;
  const punchesTotal = items.reduce((sum, g) => sum + (g.total_qty ?? 0), 0);
  const completed = items.filter(
    (g) => (g.total_qty ?? 0) >= (g.card?.stamps_required ?? Infinity)
  ).length;

  return (
    <CustomerListSection
      kicker="Loyalty"
      title="My Stamp Cards"
      subtitle="Track your punches and see how close you are to rewards."
      divider
      actions={
        cardsCount > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary" className="gap-1.5">
              <Ticket className="h-3.5 w-3.5" />
              {cardsCount} cards
            </Badge>
            <Badge className="gap-1.5">{punchesTotal} punches</Badge>
            <Badge variant="outline" className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {completed} completed
            </Badge>
          </div>
        ) : null
      }
      contentClassName="pt-2"
    >
      <StampPunchesResponsive items={items} />
    </CustomerListSection>
  );
}
