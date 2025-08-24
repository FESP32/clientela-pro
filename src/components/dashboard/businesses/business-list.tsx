import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store } from "lucide-react";

type ListMyBusinessesAction = () => Promise<{
  error?: string;
  data: Array<{
    id: string;
    name: string;
    description: string | null;
    website_url: string | null;
    instagram_url: string | null;
    facebook_url: string | null;
    image_path: string | null;
    image_url: string | null;
    is_active: boolean; // if your column is is_active, map it in the action to `active`
    owner_id: string;
    created_at: string;
  }>;
}>;

type SetActiveBusinessAction = (fd: FormData) => Promise<void>;

/** Server Component */
export default async function BusinessList({
  action,
  setActiveAction,
  title = "My Businesses",
}: {
  action: ListMyBusinessesAction;
  setActiveAction: SetActiveBusinessAction;
  title?: string;
}) {
  const { error, data } = await action();

  return (
    <Card className="w-full">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Badge variant="secondary">
          {data.length} {data.length === 1 ? "item" : "items"}
        </Badge>
      </CardHeader>

      <CardContent>
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No businesses found.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((b) => (
              <li key={b.id} className="space-y-3">
                {/* Clickable area: form + button submits to setActiveAction */}
                <form action={setActiveAction}>
                  <input type="hidden" name="business_id" value={b.id} />
                  <button
                    type="submit"
                    className="group block w-full rounded-lg border overflow-hidden text-left hover:ring-2 hover:ring-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 transition"
                    aria-label={`Set ${b.name} as active`}
                    disabled={b.is_active}
                  >
                    <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                      {b.image_url ? (
                        <Image
                          src={
                            b.image_url
                          }
                          alt={b.name}
                          width={640}
                          height={360}
                          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="h-full w-full grid place-items-center text-muted-foreground text-sm">
                          <Store className="size-16 sm:size-24" />
                        </div>
                      )}
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold line-clamp-1">{b.name}</h3>
                        <Badge variant={b.is_active ? "default" : "secondary"}>
                          {b.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      {b.description ? (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {b.description}
                        </p>
                      ) : null}

                      <p className="text-xs text-muted-foreground">
                        {b.is_active
                          ? "This is your active business."
                          : "Click to set as active."}
                      </p>
                    </div>
                  </button>
                </form>

                {/* External links and details remain as normal links (not part of the submit button) */}
                <div className="flex flex-wrap gap-2 pt-1 text-xs">
                  {b.website_url && (
                    <Link
                      href={b.website_url}
                      className="underline underline-offset-4"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Website
                    </Link>
                  )}
                  {b.instagram_url && (
                    <Link
                      href={b.instagram_url}
                      className="underline underline-offset-4"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Instagram
                    </Link>
                  )}
                  {b.facebook_url && (
                    <Link
                      href={b.facebook_url}
                      className="underline underline-offset-4"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Facebook
                    </Link>
                  )}
                  <Link
                    href={`/dashboard/businesses/${b.id}`}
                    className="underline underline-offset-4"
                  >
                    View details
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
