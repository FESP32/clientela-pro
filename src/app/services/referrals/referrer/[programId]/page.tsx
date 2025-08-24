import ProgramJoin from "@/components/dashboard/referrals/referral-program-join";
import { joinReferralProgram } from "@/actions/referrals";

export const dynamic = "force-dynamic";

export default async function JoinReferralProgramPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;

  return (
    <div className="p-4">
      <ProgramJoin action={joinReferralProgram} programId={programId} />
    </div>
  );
}
