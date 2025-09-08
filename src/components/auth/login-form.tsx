import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/actions/auth";

export function LoginForm({ next }: { next?: string } ) {
  return (
    <div className={"flex flex-col gap-6"}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
      </div>

      <div className="grid gap-3">
        {/* Facebook */}
        {/* <form action={signInWithFacebook}>
          <Button
            type="submit"
            aria-label="Continue with Facebook"
            className={cn(
              "w-full h-14 rounded-[22px]",
              "bg-[#1877F2] hover:bg-[#166FE5] text-white",
              "flex items-center justify-start gap-3 px-4",
              "shadow-sm focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-[#1877F2] focus-visible:ring-offset-2"
            )}
          >
            <span
              aria-hidden
              className="inline-flex h-7 w-7 items-center justify-center"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 fill-white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M13.5 8.5V7.1c0-.7.5-1.1 1.2-1.1h1.3V3.5h-2.3c-2.3 0-3.7 1.4-3.7 3.6v1.4H8v2.6h2V20h3v-8.9h2.1l.3-2.6h-2.4z" />
              </svg>
            </span>
            <span className="mx-auto pr-7 text-base font-semibold tracking-wide">
              Continue with Facebook
            </span>
          </Button>
        </form> */}

        {/* Google */}
        <form action={signInWithGoogle.bind(null, next)}>
          <Button
            type="submit"
            aria-label="Continue with Google"
            className={cn(
              "w-full h-14 rounded-[22px]",
              "bg-white text-neutral-900",
              "ring-1 ring-neutral-200 hover:bg-neutral-50",
              "flex items-center justify-start gap-3 px-4",
              "shadow-sm focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-neutral-300 focus-visible:ring-offset-2"
            )}
          >
            <span
              aria-hidden
              className="inline-flex h-7 w-7 items-center justify-center"
            >
              {/* Google colored G */}
              <svg
                viewBox="0 0 48 48"
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
            </span>
            <span className="mx-auto pr-7 text-base font-semibold tracking-wide">
              Continue with Google
            </span>
          </Button>
        </form>
      </div>
    </div>
  );
}
