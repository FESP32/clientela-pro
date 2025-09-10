// components/billing/upgrade-sonner-gate.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function UpgradeSonnerGate() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const sent = sp.get("sent");
    const err = sp.get("err");
    if (!sent) return;

    if (sent === "1") {
      toast.success("Upgrade request sent", {
        description: "We’ll be in touch shortly.",
      });
    } else {
      toast.error("Couldn’t send your request", {
        description: err ? decodeURIComponent(err) : "Please try again.",
      });
    }

    // Clean the URL so refreshes don’t re-toast
    router.replace(pathname);
  }, [sp, router, pathname]);

  return null;
}
