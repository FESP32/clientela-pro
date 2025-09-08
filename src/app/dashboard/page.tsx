import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  ClipboardList,
  Stamp,
  Share2,
  Gift,
  Store,
  Package2,
} from "lucide-react";
import { listLatestSurveys, listLatestStamps } from "@/actions";
import { fmt } from "@/lib/utils";
import { MotionSection, MotionItem } from "@/components/motion/fade-up";

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
    icon: Package2,
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
      <MotionSection className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <MotionItem key={action.href}>
              <Button
                asChild
                variant="outline"
                className="h-32 w-full flex flex-col items-center justify-center gap-3 p-4 text-center transition-transform duration-200 will-change-transform hover:-translate-y-0.5 hover:shadow-md"
              >
                <Link href={action.href}>
                  <Icon className="size-8 text-primary" />
                  <div>
                    <p className="font-semibold text-md">{action.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {action.desc}
                    </p>
                  </div>
                </Link>
              </Button>
            </MotionItem>
          );
        })}
      </MotionSection>

      {/* Horizontal Sections */}
      <MotionSection className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Latest Surveys */}
        <MotionItem>
          <Card className="transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
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
        </MotionItem>

        {/* Latest Stamps */}
        <MotionItem>
          <Card className="transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
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
        </MotionItem>
      </MotionSection>
    </div>
  );
}
