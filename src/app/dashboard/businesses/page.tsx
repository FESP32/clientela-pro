// app/dashboard/businesses/page.tsx
import BusinessList from "@/components/dashboard/businesses/business-list";
import { listMyBusinesses, setActiveBusiness } from "@/actions/businesses";

export default async function BusinessesPage() {
  return (
    <div className="p-4">
      <BusinessList
        action={listMyBusinesses}
        setActiveAction={setActiveBusiness}
      />
    </div>
  );
}
