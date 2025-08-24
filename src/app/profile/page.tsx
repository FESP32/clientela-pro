// app/profile/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import SignOut from "@/components/auth/sign-out";

type ProfileRow = {
  user_id: string;
  name: string | null;
  subscription_plan: "free" | "premium";
  user_type: string;
  created_at: string | null;
  updated_at: string | null;
};

export default async function ProfilePage() {
  const supabase = await createClient();

  // Get the current session (server-side)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the profile subject to RLS (user can only see their own)
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single<ProfileRow>();

  if (error) {
    // Optionally, you could redirect or render a friendly message
    return (
      <Card className="max-w-xl mx-auto mt-10">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Couldn’t load your profile. {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  const joined = profile?.created_at
    ? format(new Date(profile.created_at), "PPP")
    : "—";

  return (
    <Card className="max-w-xl mx-auto mt-10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Profile</CardTitle>
          <Badge variant="secondary">
            {profile.subscription_plan === "premium" ? "Premium" : "Free"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">Name</p>
          <p className="text-base">{profile.name ?? "—"}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">User Type</p>
          <p className="text-base">{profile.user_type ?? "—"}</p>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">User ID</p>
            <p className="text-[13px] break-all">{profile.user_id}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Joined</p>
            <p className="text-[13px]">{joined}</p>
          </div>
        </div>

        <Separator />

        <CardFooter>
          <SignOut />
        </CardFooter>
      </CardContent>
    </Card>
  );
}
