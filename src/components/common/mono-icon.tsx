"use client";

export default function MonoIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 bg-white/60 shadow-sm backdrop-blur supports-[backdrop-filter]:backdrop-blur-md dark:bg-white/5 dark:border-white/15">
      {children}
    </span>
  );
}
