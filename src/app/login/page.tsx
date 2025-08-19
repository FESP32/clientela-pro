// app/login/page.tsx
import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Image"
              width={32}
              height={32}
              className="dark:brightness-[0.2] dark:grayscale"
            />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:flex items-center justify-center">
        <Image
          src="/logo.svg"
          alt="Image"
          width={128}
          height={128}
          className="dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
