import Link from "next/link";
import { HeartHandshake, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Background from "@/components/common/background";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Page content */}
      <Background />  
      <main className="">{children}</main>

      {/* Bottom Navigation — same position, responsive + premium look */}
      <nav
        className={cn(
          "sticky bottom-0 left-0 right-0 border-t",
          // premium glassy surface that adapts to theme
          "bg-background/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md",
          "dark:bg-background/60"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Primary"
      >
        {/* subtle top highlight */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

        {/* responsive container */}
        <div className="mx-auto w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
          <div className="flex justify-around sm:justify-center sm:gap-16 px-2 sm:px-6 py-2 sm:py-3">
            <Link
              href="/services"
              className={cn(
                "flex flex-col items-center",
                "px-4 py-1.5 rounded-lg transition-colors",
                "text-[11px] sm:text-xs md:text-sm text-muted-foreground hover:text-foreground",
                "hover:bg-foreground/[0.04]"
              )}
            >
              <HeartHandshake className="h-5 w-5 sm:h-5 sm:w-5" />
              <span className="mt-0.5 sm:mt-1">Services</span>
            </Link>

            <Link
              href="/profile"
              className={cn(
                "flex flex-col items-center",
                "px-4 py-1.5 rounded-lg transition-colors",
                "text-[11px] sm:text-xs md:text-sm text-muted-foreground hover:text-foreground",
                "hover:bg-foreground/[0.04]"
              )}
            >
              <User className="h-5 w-5 sm:h-5 sm:w-5" />
              <span className="mt-0.5 sm:mt-1">Profile</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
