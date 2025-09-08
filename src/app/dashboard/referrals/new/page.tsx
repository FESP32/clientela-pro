// app/(dashboard)/referrals/new/page.tsx
import { createReferralProgram } from "@/actions"; // your server action
import NewReferralProgramForm from "@/components/dashboard/referrals/new-referral-program-form";

export const dynamic = "force-dynamic";

export default async function NewReferralProgramPage() {
  return (
    <div className="px-5 sm:px-6 lg:px-16 mt-8 mb-16">
      <NewReferralProgramForm onSubmit={createReferralProgram} />
    </div>
  );
}
