import Link from "next/link";
import { Home, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Page content */}
      <main className="">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background">
        <div className="flex justify-around">
          <Link
            href="/services"
            className={cn(
              "flex flex-col items-center py-2 px-4 text-sm text-muted-foreground hover:text-foreground"
            )}
          >
            <Home className="h-5 w-5" />
            <span>Services</span>
          </Link>

          <Link
            href="/profile"
            className={cn(
              "flex flex-col items-center py-2 px-4 text-sm text-muted-foreground hover:text-foreground"
            )}
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
