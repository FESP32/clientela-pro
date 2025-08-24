// app/stamps/[cardId]/join/page.tsx
import StampMembershipCreate from "@/components/dashboard/stamps/stamp-membership-create";
import { createStampMembership } from "@/actions/stamps";

export const dynamic = "force-dynamic";

export default async function JoinStampCardPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  return (
    <div className="p-4">
      <StampMembershipCreate action={createStampMembership} cardId={cardId} />
    </div>
  );
}
