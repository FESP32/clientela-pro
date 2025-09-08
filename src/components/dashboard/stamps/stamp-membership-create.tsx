import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { Sparkles, Stamp } from "lucide-react";
import CustomerJoinStamp from "./customer-join-stamp";

export default async function StampMembershipCreate({
  cardId,
  title = "Add this card to my account",
  cta = "Create my card",
  action,
}: {
  cardId: string;
  title?: string;
  cta?: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not signed in → friendly prompt (no cards)
  if (!user) {
    return (
      <section aria-labelledby="join-stamp-title" className="space-y-3">
        <h2
          id="join-stamp-title"
          className="text-xl font-semibold flex items-center gap-2"
        >
          <Stamp className="h-5 w -5 text-primary" aria-hidden />
          Sign in required
        </h2>
        <p className="text-sm text-muted-foreground">
          Please sign in to add this stamp card to your account.
        </p>
        <div className="flex justify-end">
          <Button asChild>
            <Link href={`/login?next=/services/stamps/${cardId}/join`}>Sign in</Link>
          </Button>
        </div>
      </section>
    );
  }

  // Already has instance?
  const { count } = await supabase
    .from("stamp_punch")
    .select("*", { count: "exact", head: true })
    .eq("card_id", cardId)
    .eq("customer_id", user.id);

  const alreadyHasInstance = (count ?? 0) > 0;

  if (alreadyHasInstance) {
    return (
      <section aria-labelledby="join-stamp-exists" className="space-y-3">
        <h2
          id="join-stamp-exists"
          className="text-xl font-semibold flex items-center gap-2"
        >
          <Sparkles className="h-5 w-5 text-yellow-500" aria-hidden />
          Already added
        </h2>
        <p className="text-sm text-muted-foreground">
          You already have this stamp card in your account.
        </p>
        <div className="flex justify-end gap-2">
          <Button asChild variant="outline">
            <Link href={`/services/stamps/${cardId}`}>View my card</Link>
          </Button>
        </div>
      </section>
    );
  }

  // Create view (animated, welcoming)
  return (
    <CustomerJoinStamp
      title={title}
      cta={cta}
      cardId={cardId}
      action={action}
    />
  );
}
