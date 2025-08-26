// app/dashboard/businesses/page.tsx
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import BusinessList from "@/components/dashboard/businesses/business-list";
import { listMyBusinesses, setActiveBusiness } from "@/actions/businesses";
import type { BusinessWithMembership } from "@/types";

export const dynamic = "force-dynamic";

export default async function BusinessesPage() {
  const { data, error } = await listMyBusinesses();

  return (
    <div className=" w-full max-w-6xl p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            My Businesses
          </h1>
          <p className="text-sm text-muted-foreground">
            These are the businesses you belong to (owner, admin, or member).
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/businesses/new">Create business</Link>
        </Button>
      </div>

      <Separator className="my-4" />

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
          {typeof error === "string"
            ? error
            : "Something went wrong loading your businesses."}
        </div>
      ) : (
        <BusinessList
          items={(data ?? []) as BusinessWithMembership[]}
          setActiveAction={setActiveBusiness}
        />
      )}
    </div>
  );
}
