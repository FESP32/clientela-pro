// app/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Compass, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full border bg-background">
          <Compass className="h-5 w-5 text-muted-foreground" aria-hidden />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn’t find what you were looking for.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/services">
              <Home className="mr-2 h-4 w-4" />
              Go to Services
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="mt-6 text-[11px] text-muted-foreground">
          Error code: <Badge variant="secondary">404</Badge>
        </div>
      </div>
    </main>
  );
}
