import IntentClaimCard from "@/components/services/stamps/intent-claim-card";

export const dynamic = "force-dynamic";

export default async function IntentPage({
  params,
}: {
  params: Promise<{ intentId: string }>;
}) {
  const { intentId } = await params;
  return (
    <div className="p-4">
      <IntentClaimCard intentId={intentId} />
    </div>
  );
}
