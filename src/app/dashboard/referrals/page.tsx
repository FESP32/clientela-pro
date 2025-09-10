// app/dashboard/referrals/page.tsx
import { listReferralPrograms } from "@/actions";
import MerchantListSection from "@/components/common/merchant-list-section";
import ReferralProgramsExplorer from "@/components/dashboard/referrals/referral-programs-explorer";
import { Badge } from "@/components/ui/badge";
import { Users, Gift, Tag, Megaphone } from "lucide-react";

export const dynamic = "force-dynamic";

/** Subtle circular icon (Apple-like) */
function MonoIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 bg-white/60 shadow-sm backdrop-blur supports-[backdrop-filter]:backdrop-blur-md dark:bg-white/5 dark:border-white/15">
      {children}
    </span>
  );
}

export default async function ReferralProgramsPage() {
  const programs = await listReferralPrograms();

  const total = programs.length;
  const active = !!programs.filter((p) => p.status === "active");
  const withRewards = programs.filter(
    (p) => Boolean(p.referrer_reward) || Boolean(p.referred_reward)
  ).length;

  return (
    <MerchantListSection
      title={
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <MonoIcon>
              <Megaphone className="size-4" aria-hidden="true" />
            </MonoIcon>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Referral Programs
            </h1>
          </div>

          {/* Badges instead of stat chips */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {total} total
            </Badge>
            <Badge className="gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              {active} active
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <Gift className="h-3.5 w-3.5" />
              {withRewards} with rewards
            </Badge>
          </div>
        </div>
      }
      subtitle={
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Tag className="h-4 w-4" aria-hidden="true" />
            Manage codes, rewards, and status with quick filters.
          </span>
        </div>
      }
      headerClassName="mb-4"
      contentClassName="space-y-4"
    >
      {/* Hairline divider for subtle structure */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

      <ReferralProgramsExplorer programs={programs} />
    </MerchantListSection>
  );
}
