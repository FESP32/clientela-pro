import { ArrowUpRight, Forward } from "lucide-react";
import { Button } from "../ui/button";

export default function CTABanner() {
  return (
    <div className="px-6">
      <div className="dark:border relative overflow-hidden my-20 w-full bg-background text-foreground max-w-screen-lg mx-auto rounded-2xl py-10 md:py-16 px-6 md:px-14">
        <div className="relative z-0 flex flex-col gap-3">
          <h3 className="text-3xl md:text-4xl font-semibold">
            Ready to Grow Your Business with Clientela Pro?
          </h3>
          <p className="mt-2 text-base md:text-lg max-w-prose">
            Create loyalty cards, run surveys, reward referrals, and surprise
            customers with gifts—all in one simple platform. Start building
            stronger customer relationships today.
          </p>
        </div>

        <div className="relative z-0 mt-14 flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild>
            <a href="/login">
              Get Started Free <ArrowUpRight className="!h-5 !w-5" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
