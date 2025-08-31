// app/dashboard/stamps/page.tsx
import { listStampCards, deleteStampCard } from "@/actions";
import MerchantListSection from "@/components/dashboard/common/merchant-list-section";
import MonoIcon from "@/components/dashboard/common/mono-icon";
import StampCardsExplorer from "@/components/dashboard/stamps/stamp-cards-explorer";
import { Badge } from "@/components/ui/badge";
import { StampCardListItem } from "@/types";
import { Stamp, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LoyaltyCardsPage() {
  const { cards = [] } = await listStampCards();

  const now = Date.now();
  const total = cards.length;
  const active = cards.filter((c: StampCardListItem) => c.is_active).length;
  const liveNow = cards.filter((c: StampCardListItem) => {
    const start = c.valid_from ? new Date(c.valid_from).getTime() : undefined;
    const end = c.valid_to ? new Date(c.valid_to).getTime() : undefined;
    const afterStart = start === undefined || now >= start;
    const beforeEnd = end === undefined || now <= end;
    return afterStart && beforeEnd;
  }).length;

  return (
    <MerchantListSection
      title={
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <MonoIcon>
              <Stamp
                className="h-4 w-4 text-foreground/80"
                aria-hidden="true"
              />
            </MonoIcon>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Cards
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5">
              {total} total
            </Badge>
            <Badge variant="secondary" className="gap-1.5">
              {active} active
            </Badge>
            <Badge variant="secondary" className="gap-1.5">
              {liveNow} live now
            </Badge>
          </div>
        </div>
      }
      subtitle={
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Reward loyalty with clear goals and windows.
          </span>
        </div>
      }
      className="pt-2"
      headerClassName="mb-4"
      contentClassName="space-y-4"
    >
      {/* Hairline divider for subtle structure */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

      <StampCardsExplorer cards={cards} deleteStampCard={deleteStampCard} />
    </MerchantListSection>
  );
}
