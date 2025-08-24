// app/(dashboard)/referrals/new/page.tsx
import { createReferralProgram } from "@/actions/referrals"; // your server action
import NewReferralProgramForm from "@/components/dashboard/referrals/new-referral-program-form";

export const dynamic = "force-dynamic";

export default async function NewReferralProgramPage() {
  return (
    <div className="p-4">
      <NewReferralProgramForm onSubmit={createReferralProgram} />
    </div>
  );
}
