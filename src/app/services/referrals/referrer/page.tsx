// app/referrals/joined/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { listJoinedReferralProgramsWithIntents } from "@/actions/referrals";
import JoinedReferralProgramsList from "@/components/dashboard/referrals/joined-programs-list";

export const dynamic = "force-dynamic";

export default async function JoinedProgramsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/referrals/joined");

  const items = await listJoinedReferralProgramsWithIntents();  

  return (
    <div className="p-4">
      <JoinedReferralProgramsList items={items} />
    </div>
  );
}
