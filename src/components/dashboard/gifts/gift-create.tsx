import { createGift } from "@/actions/gifts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // if you don't have it, swap for <Input>
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = {
  action?: (fd: FormData) => Promise<void>;
  title?: string;
};

export default function GiftCreate({
  action = createGift,
  title = "Create a gift",
}: Props) {
  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. Free Month"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            {/* If you don't have a Textarea component, use <Input id="description" name="description" /> */}
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the gift…"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL (optional)</Label>
            <Input
              id="image_url"
              name="image_url"
              placeholder="https://…"
              type="url"
            />
          </div>

          <Button type="submit" className="w-full">
            Save gift
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-end gap-2">
        <Button asChild variant="ghost">
          <Link href="/dashboard/gifts">Back to gifts</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
