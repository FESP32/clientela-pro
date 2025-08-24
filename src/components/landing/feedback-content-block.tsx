import { Gift, ListChecks, Sparkles, Stamp, Share2 } from "lucide-react";

export function FeedbackContentBlock() {
  return (
    <div>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
        Understand customers faster
      </h2>
      <p className="mt-4 text-base text-muted-foreground max-w-prose">
        Create branded surveys that capture feedback at the right moment and
        turn answers into action.
      </p>

      <ul className="mt-6 space-y-3 text-base">
        <li className="flex items-start gap-3">
          <ListChecks className="h-5 w-5 text-primary mt-0.5" />
          <span className="text-foreground/90">
            <strong>Quick surveys</strong> with logic and custom fields.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary mt-0.5" />
          <span className="text-foreground/90">
            <strong>Branded look</strong> that feels native to your business.
          </span>
        </li>
      </ul>
    </div>
  );
}
