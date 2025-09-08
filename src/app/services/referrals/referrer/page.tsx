// app/referrals/joined/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { listJoinedReferralProgramsWithIntents } from "@/actions";

import CustomerListSection from "@/components/common/customer-list-section";
import JoinedReferralProgramsList from "@/components/services/referrals/joined-programs-list";
import { Badge } from "@/components/ui/badge";
import { Users, BadgePercent } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function JoinedProgramsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/referrals/joined");

  const items = await listJoinedReferralProgramsWithIntents();

  const total = items.length;
  const active = items.filter((p) => p.is_active).length;
  const inactive = total - active;

  return (
    <CustomerListSection
      kicker="Referrals"
      title={
        <span className="inline-flex items-center gap-2">
          <BadgePercent className="h-6 w-6 text-foreground/80" />
          Joined Programs
        </span>
      }
      subtitle="Programs you’ve joined — check status, codes, and rewards."
      divider
      actions={
        total > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary" className="gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {total} total
            </Badge>
            <Badge className="gap-1.5">{active} active</Badge>
            <Badge variant="outline" className="gap-1.5">
              {inactive} inactive
            </Badge>
          </div>
        ) : null
      }
      contentClassName="pt-2"
    >
      <JoinedReferralProgramsList items={items} />
    </CustomerListSection>
  );
}
