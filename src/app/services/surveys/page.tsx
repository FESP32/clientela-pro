// components/customer/responses/my-responses-list.tsx
import CustomerListSection from "@/components/dashboard/common/customer-list-section";
import CustomerMyResponsesTable, {
  type CustomerResponseItem,
} from "@/components/services/surveys/customer-response-table";
import { getMyResponses } from "@/actions";

export default async function MyResponsesList() {
  const responses = await getMyResponses();

  return (
    <CustomerListSection
      kicker="Your feedback"
      title="My Survey Responses"
      subtitle="Here are the responses you’ve submitted. Thanks for helping us improve."
      headerMax="3xl"
      contentMax="4xl"
      divider
    >
      <CustomerMyResponsesTable
        items={responses as unknown as CustomerResponseItem[]}
      />
    </CustomerListSection>
  );
}
