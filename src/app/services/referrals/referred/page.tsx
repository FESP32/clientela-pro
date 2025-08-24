import ReferredIntentsList from "@/components/services/referrals/referred-intents-list";

export const dynamic = "force-dynamic";

export default function ReferredLanding() {
  return (
    <div className="p-4 flex justify-center">
      <ReferredIntentsList />
    </div>
  );
}
