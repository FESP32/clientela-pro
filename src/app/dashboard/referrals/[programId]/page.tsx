import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { listReferralParticipants } from "@/actions/referrals";
import ReferralParticipantsList from "@/components/dashboard/referrals/referral-participants-list";
import { getActiveBusiness } from "@/actions/businesses";

export const dynamic = "force-dynamic";

export default async function ReferralParticipantsPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;

  const supabase = await createClient();

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    redirect(`/login?next=/dashboard/referrals/${programId}`);

  const { business } = await getActiveBusiness();

  if (!business) {
    redirect("/dashboard/businesses/missing");
  }

  // Verify ownership & fetch program info
  const { data: program } = await supabase
    .from("referral_program")
    .select("id, business_id, title, code")
    .eq("id", programId)
    .eq("business_id", business.id)
    .maybeSingle();

  if (!program) {
    // Either program not found or not owned by this user
    redirect("/dashboard/referrals");
  }

  const items = await listReferralParticipants(programId);

  return (
    <div className="p-4">
      <ReferralParticipantsList
        programTitle={program.title}
        programCode={program.code ?? undefined}
        items={items}
      />
    </div>
  );
}
