// app/dashboard/gifts/my/page.tsx
import { GiftIntentListItem, listMyGiftIntents } from "@/actions";
import CustomerListSection from "@/components/dashboard/common/customer-list-section";
import CustomerMyGiftsList, {
} from "@/components/services/gifts/customer-my-gifts-table";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function MyGiftsPage() {
  const { data = [] } = await listMyGiftIntents();

  const total = data.length;
  const claimed = data.filter((r) => r.status === "claimed").length;
  const consumed = data.filter((r) => r.status === "consumed").length;
  const pending = data.filter((r) => r.status === "pending").length;

  return (
    <CustomerListSection
      kicker="For you"
      title="My Gifts"
      subtitle="All the gifts you’ve received—view status and details at a glance."
      divider
      actions={
        total > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary">{total} total</Badge>
            <Badge>{claimed} claimed</Badge>
            <Badge variant="outline">{consumed} consumed</Badge>
            <Badge variant="outline">{pending} pending</Badge>
          </div>
        ) : null
      }
      contentClassName="pt-2"
    >
      <CustomerMyGiftsList items={data as GiftIntentListItem[]} />
    </CustomerListSection>
  );
}
