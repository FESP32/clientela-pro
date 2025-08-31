import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, ClipboardList, Stamp, Share2, Gift, Store } from "lucide-react";
import { listLatestSurveys } from "@/actions";
import { listLatestStamps } from "@/actions";
import { fmt } from "@/lib/utils";

// --- actions config ---
const quickActions = [
  {
    href: "/dashboard/businesses/new",
    icon: Store,
    title: "Create Business",
    desc: "Add a new business to your catalog",
  },
  {
    href: "/dashboard/products/new",
    icon: PlusCircle,
    title: "Create Product",
    desc: "Add a new product to your catalog",
  },
  {
    href: "/dashboard/surveys/new",
    icon: ClipboardList,
    title: "Create Survey",
    desc: "Gather feedback from your customers",
  },
  {
    href: "/dashboard/stamps/new",
    icon: Stamp,
    title: "Create Stamp Card",
    desc: "Reward customers with loyalty stamps",
  },
  {
    href: "/dashboard/referrals/new",
    icon: Share2,
    title: "Create Referral",
    desc: "Launch a referral reward campaign",
  },
  {
    href: "/dashboard/gifts/new",
    icon: Gift,
    title: "Create Gift",
    desc: "Send gifts or perks to your customers",
  },
];

export default async function DashboardPage() {
  const surveys = await listLatestSurveys();
  const stamps = await listLatestStamps();

  return (
    <div className="p-6 space-y-8">
      {/* Quick Create Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.href}
              asChild
              variant="outline"
              className="h-32 flex flex-col items-center justify-center gap-3 p-4 text-center"
            >
              <Link href={action.href}>
                <Icon className="size-8 text-primary" />
                <div>
                  <p className="font-semibold text-md">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
              </Link>
            </Button>
          );
        })}
      </div>

      {/* Horizontal Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Latest Surveys */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Latest Surveys</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/surveys">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {surveys.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No surveys created yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {surveys.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <span>{s.title}</span>
                    <Badge variant="secondary">{fmt(s.created_at)}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Latest Stamps */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Latest Stamps</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/stamps">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stamps.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No stamp cards created yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {stamps.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <span>{c.title}</span>
                    <Badge variant="secondary">{fmt(c.created_at)}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
