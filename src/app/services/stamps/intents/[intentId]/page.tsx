import CustomerListSection from "@/components/common/customer-list-section";
import IntentClaimCard from "@/components/services/stamps/intent-claim-card";

export const dynamic = "force-dynamic";

export default async function IntentPage({
  params,
}: {
  params: Promise<{ intentId: string }>;
}) {
  const { intentId } = await params;
  return (
      <CustomerListSection
          kicker="Stamps"
          title="Claim stamp card to your Card"
          subtitle="Create a personal card to start collecting stamps immediately."
          divider
        >
          <IntentClaimCard intentId={intentId} />
        </CustomerListSection>

  );
}
