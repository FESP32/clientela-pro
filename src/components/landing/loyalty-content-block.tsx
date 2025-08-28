import { Gift, Stamp, Share2 } from "lucide-react";

export default function LoyaltyContentBlock() {
  return (
    <div>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
        Keep customers coming back
      </h2>
      <p className="mt-4 text-base text-muted-foreground max-w-prose">
        Launch loyalty stamp cards, gifts, and referrals in minutes—no complex
        setup. Reward repeat visits and grow through word of mouth.
      </p>

      <ul className="mt-6 space-y-3 text-base">
        <li className="flex items-start gap-3">
          <Stamp className="h-5 w-5 text-primary mt-0.5" />
          <span className="text-foreground/90">
            Digital <strong>stamp cards</strong> with custom goals and rewards.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <Gift className="h-5 w-5 text-primary mt-0.5" />
          <span className="text-foreground/90">
            <strong>Perks & gifts</strong> customers can redeem instantly.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <Share2 className="h-5 w-5 text-primary mt-0.5" />
          <span className="text-foreground/90">
            <strong>Referral links</strong> that reward both sides.
          </span>
        </li>
      </ul>
    </div>
  );
}
