// components/dashboard/stamp-membership-create.tsx
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";


export default async function StampMembershipCreate({
  cardId,
  title = "Add this card to my account",
  cta = "Create my card",
  action
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

  // If your middleware already forces auth, this is just a guard.
  if (!user) {
    return (
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Sign in required</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please sign in to add this stamp card to your account.
          </p>
        </CardContent>
        <CardFooter className="justify-end">
          <Button asChild>
            <Link href={`/login?next=/stamps/${cardId}/join`}>Sign in</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Check if the user already has an instance (>= 1 punch on this card)
  const { count } = await supabase
    .from("stamp_punches")
    .select("*", { count: "exact", head: true })
    .eq("card_id", cardId)
    .eq("customer_id", user.id);

  const alreadyHasInstance = (count ?? 0) > 0;

  if (alreadyHasInstance) {
    return (
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Already added</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You already have this stamp card in your account.
          </p>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button asChild variant="outline">
            <Link href={`/services/stamps/${cardId}`}>View my card</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Not added yet → show creation form
  return (
    <Card className="max-w-md">
      <form action={action} className="contents">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <input type="hidden" name="card_id" value={cardId} />
          <p className="text-sm text-muted-foreground">
            This will create a personal instance of the stamp card for your
            account. You can start collecting stamps right away.
          </p>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit">{cta}</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
