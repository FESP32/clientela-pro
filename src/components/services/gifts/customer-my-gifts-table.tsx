// components/customer/gifts/customer-my-gifts-list.tsx
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fmt } from "@/lib/utils";
import {
  CheckCircle2,
  BadgeCheck,
  Timer,
  AlertTriangle,
  Building2,
  CalendarClock,
  Gift as GiftIcon,
} from "lucide-react";
import { GiftIntentListItem } from "@/types";

function statusMeta(status: string) {
  const up = status.toUpperCase();
  if (status === "claimed")
    return { label: up, Icon: CheckCircle2, variant: "default" as const };
  if (status === "consumed")
    return { label: up, Icon: BadgeCheck, variant: "secondary" as const };
  if (status === "pending")
    return { label: up, Icon: Timer, variant: "outline" as const };
  return { label: up, Icon: AlertTriangle, variant: "destructive" as const };
}

export default function CustomerMyGiftsTable({
  items,
}: {
  items: GiftIntentListItem[];
}) {
  if (!items?.length) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="py-10 text-center">
          <p className="text-sm text-muted-foreground">
            You don’t have any gifts yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((row) => {
        const g = row.gift;
        const b = g?.business;
        const { label, Icon, variant } = statusMeta(row.status);

        return (
          <Link
            key={row.id}
            href={`/services/gifts/intent/${row.id}`}
            aria-label={`Open gift ${g?.title ?? "Gift"}`}
            className="group relative block rounded-2xl p-[1px] transition-all duration-300
                       bg-gradient-to-tr from-emerald-400/20 via-transparent to-fuchsia-400/20
                       hover:from-emerald-400/30 hover:to-fuchsia-400/30
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
          >
            <Card
              className="flex h-full cursor-pointer flex-col rounded-[calc(theme(borderRadius.lg)+6px)]
                         border border-foreground/10 bg-background/80 backdrop-blur
                         transition-all duration-300 hover:shadow-lg"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-md border bg-muted/60">
                    <GiftIcon className="h-4 w-4 opacity-80" />
                  </span>
                  <CardTitle className="text-base truncate">
                    {g?.title ?? "Gift"}
                  </CardTitle>
                </div>
                <Badge variant={variant} className="text-[10px] tracking-wide">
                  <Icon className="mr-1.5 h-3.5 w-3.5" />
                  {label}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-3">
                {g?.image_url ? (
                  <div className="relative w-full h-40 overflow-hidden rounded-md border">
                    <Image
                      src={g.image_url}
                      alt={g.title ?? "Gift image"}
                      fill
                      className="object-cover transition-transform duration-500 will-change-transform group-hover:scale-[1.03]"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/70 to-transparent" />
                  </div>
                ) : null}

                <div className="text-sm text-muted-foreground space-y-2">
                  {g?.description ? (
                    <p className="line-clamp-3">{g.description}</p>
                  ) : null}

                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 opacity-70" />
                    <span>
                      <span className="font-medium text-foreground">
                        Business:{" "}
                      </span>
                      {b?.name ?? "—"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 opacity-70" />
                    <span>
                      <span className="font-medium text-foreground">
                        Received:{" "}
                      </span>
                      {fmt(row.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 opacity-70" />
                    <span>
                      <span className="font-medium text-foreground">
                        Expires:{" "}
                      </span>
                      {row.expires_at ? fmt(row.expires_at) : "No expiry"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* soft glow on hover */}
            <div
              className="pointer-events-none absolute inset-0 -z-10 rounded-2xl opacity-0 blur-xl
                         transition-opacity duration-300 group-hover:opacity-40
                         bg-[radial-gradient(60%_60%_at_50%_50%,theme(colors.emerald.400/.25),transparent)]"
            />
          </Link>
        );
      })}
    </div>
  );
}
