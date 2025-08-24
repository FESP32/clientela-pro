// components/stamps/punch-card.tsx
import Link from "next/link";
import {
  Card as UICard,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/dashboard/stamps/progress-bar";
import StampDots from "@/components/dashboard/stamps/stamp-dots";
import { fmt } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

type CardType = {
  id: string;
  title: string | null;
  goal_text?: string | null;
  stamps_required?: number | null;
  is_active: boolean;
  valid_from?: string | null;
  valid_to?: string | null;
};

type MembershipType = {
  qty?: number | null;
  completed_at?: string | null;
};

function isActive(card: CardType) {
  const now = new Date();
  const startsOk = !card.valid_from || new Date(card.valid_from) <= now;
  const endsOk = !card.valid_to || now <= new Date(card.valid_to);
  return card.is_active && startsOk && endsOk;
}

export default function StampCard({
  card,
  membership,
}: {
  card: CardType;
  membership: MembershipType;
}) {
  const punches = membership.qty ?? 0;
  const total = card.stamps_required ?? 1;
  const remaining = Math.max(0, total - punches);
  const pct = (punches / total) * 100;
  const active = isActive(card);

  return (
    <UICard className="mx-auto max-w-3xl">
      <CardHeader className="flex items-center justify-between gap-4">
        <CardTitle className="text-lg sm:text-xl">{card.title}</CardTitle>
        <div className="flex gap-2">
          {active ? (
            <Badge>Active</Badge>
          ) : (
            <Badge variant="outline">Inactive</Badge>
          )}
          <Badge variant="secondary">{total} stamps</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">Reward</p>
          <p className="text-sm">{card.goal_text}</p>
        </div>

        {(card.valid_from || card.valid_to) && (
          <div className="text-xs text-muted-foreground">
            Valid: {fmt(card.valid_from)} — {fmt(card.valid_to)}
          </div>
        )}

        {/* Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span>
              {punches}/{total} ({Math.round(pct)}%)
            </span>
          </div>
          <ProgressBar pct={pct} />
          <StampDots total={total} filled={punches} />
          <div className="flex items-center gap-3 text-sm">
            <Badge variant="secondary">Remaining: {remaining}</Badge>
            {membership.completed_at ? <Badge>Goal reached 🎉</Badge> : null}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button asChild variant="outline" className="group">
          <Link href="/services/stamps">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Stamps
          </Link>
        </Button>
      </CardFooter>
    </UICard>
  );
}
