// components/auth/login-form.tsx
import { cn } from "@/lib/utils";
import MagicLinkLoginForm from "./magic-link-login-form";
import GoogleLoginForm from "./google-login-form";
import { User } from "lucide-react";

export function LoginForm({ next }: { next?: string }) {
  return (
    <div className={cn("flex flex-col gap-6")}>
      <div className="flex flex-col items-center gap-2 text-center">
        <User className="mx-auto mb-2 h-10 w-10 text-primary" />
        <h1 className="text-2xl font-bold">Login to your account</h1>
      </div>

      <div className="grid gap-3">
        <MagicLinkLoginForm next={next} />
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        <GoogleLoginForm next={next} />
      </div>
    </div>
  );
}
