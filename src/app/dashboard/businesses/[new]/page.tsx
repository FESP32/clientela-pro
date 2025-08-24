import { createBusiness } from "@/actions/businesses";
import BusinessCreate from "@/components/dashboard/businesses/business-create";

export const dynamic = "force-dynamic";

export default function NewBusinessPage() {
  return (
    <div className="p-4 flex justify-center">
      <BusinessCreate action={createBusiness} />
    </div>
  );
}
