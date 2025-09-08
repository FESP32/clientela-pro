import { createBusiness } from "@/actions";
import BusinessCreate from "@/components/dashboard/businesses/business-create";

export const dynamic = "force-dynamic";

export default function NewBusinessPage() {
  return (
    <div className="px-5 sm:px-6 lg:px-16 mt-8 mb-16">
      <BusinessCreate action={createBusiness} />
    </div>
  );
}
