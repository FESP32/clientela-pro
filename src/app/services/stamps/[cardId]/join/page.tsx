import StampMembershipCreate from "@/components/dashboard/stamps/stamp-membership-create";
import { createStampMembership } from "@/actions";
import CustomerListSection from "@/components/common/customer-list-section";

export const dynamic = "force-dynamic";

export default async function JoinStampCardPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;

  return (
    <CustomerListSection
      kicker="Stamps"
      title="Add this stamp card to your account"
      subtitle="Create a personal card to start collecting stamps immediately."
      divider
    >
      <StampMembershipCreate action={createStampMembership} cardId={cardId} />
    </CustomerListSection>
  );
}
