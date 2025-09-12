import { createClient } from "@/utils/supabase/server";
import CustomerGiftIntent from "@/components/services/gifts/customer-gift-intent";
import CustomerListSection from "@/components/common/customer-list-section";

export const dynamic = "force-dynamic";

export default async function GiftConsumePage({
  params,
}: {
  params: Promise<{ intentId: string }>;
}) {
  const { intentId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <CustomerListSection
      kicker="For you"
      title="My Gifts"
      subtitle="All the gifts you’ve received—view status and details at a glance."
      divider
      contentClassName="pt-2"
    >
      <CustomerGiftIntent intentId={intentId} userId={user?.id ?? null} />
    </CustomerListSection>
  );
}
