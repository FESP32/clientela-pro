export const dynamic = "force-dynamic";

import CustomerListSection from "@/components/common/customer-list-section";
import ReferredIntentView from "@/components/services/referrals/referred-intent-view";

export default async function ReferredIntentPage({
  params,
}: {
  params: Promise<{ intentId: string }>;
}) {
  const { intentId } = await params;

  return (
    <CustomerListSection
      kicker="Referrals"
      title="Referral invite"
      subtitle="View details and claim your invite."
      divider
      contentClassName="pt-2 h-screen"
    >
      <ReferredIntentView intentId={intentId} />
    </CustomerListSection>
  );
}
