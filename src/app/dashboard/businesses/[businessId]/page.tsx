import BusinessDetailPanel from "@/components/dashboard/businesses/business-detail-panel";
export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  return <BusinessDetailPanel businessId={businessId} />;
}
