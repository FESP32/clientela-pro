"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import SmileyRespond from "@/components/services/surveys/smiley-survey";
import { SurveyRow, Trait } from "@/types";
import { Separator } from "@/components/ui/separator";
import { ClipboardList, Info, CheckCircle2, LogIn } from "lucide-react";

type Props = {
  survey: SurveyRow;
  isAuthenticated: boolean;
  hasResponded: boolean;
  onSubmit: (
    formData: FormData
  ) => Promise<{ success: boolean; message: string }>;
};

export default function RespondForm({
  survey,
  isAuthenticated,
  hasResponded,
  onSubmit,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const formDisabled = submitted || isPending || hasResponded;
  const requiresAuth = !survey.is_anonymous;

  // Can submit when not submitted yet, not already responded,
  // and either the survey is anonymous OR (non-anonymous + user is authenticated)
  const canSubmit =
    !submitted &&
    !hasResponded &&
    (survey.is_anonymous || (requiresAuth && isAuthenticated));

  const handleSubmit = (formData: FormData) => {
    if (submitted || hasResponded) return;

    startTransition(async () => {
      const result = await onSubmit(formData);
      if (result.success) {
        setSubmitted(true);
        toast.success(result.message || "Response submitted!");
      } else {
        toast.error(result.message || "Something went wrong.");
      }
    });
  };

  return (
    <form action={handleSubmit} className="px-5 sm:px-6 lg:px-16 py-6 min-h-screen">
      <input type="hidden" name="survey_id" value={survey.id} />
      <fieldset disabled={formDisabled} aria-busy={isPending}>
        <div className="mx-auto w-full max-w-3xl">
          {/* Header */}
          <header className="mb-5">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/50 px-3 py-1 text-xs text-muted-foreground">
              <ClipboardList className="h-3.5 w-3.5" />
              <span>Survey</span>
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                {survey.title}
              </h1>
            </div>

            {survey.description ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {survey.description}
              </p>
            ) : null}
          </header>

          {/* Hairline divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent mb-4" />

          {/* Guidance for non-anonymous surveys */}
          {!survey.is_anonymous && (
            <div className="mb-4 flex items-start gap-2 rounded-md border border-foreground/10 bg-background/50 px-3 py-2 text-sm">
              <Info className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="text-muted-foreground">
                This survey requires sign-in so your response can be associated
                with your account.
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="space-y-6">
            {/* Smiley picker (hidden if already responded) */}
            {!hasResponded && survey.traits && (
              <SmileyRespond
                surveyTitle={survey.title}
                traits={survey.traits as Trait[]}
              />
            )}

            {/* Status messages (standalone blocks, not inside <p> wrapping other elements) */}
            {hasResponded && (
              <div className="text-sm text-muted-foreground" aria-live="polite">
                You’ve already responded to this survey.
              </div>
            )}

            {submitted && !hasResponded && (
              <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/60 px-3 py-1 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Thanks! Your response has been recorded.</span>
              </div>
            )}

            {!survey.is_anonymous && !isAuthenticated && !hasResponded && (
              <div className="text-sm text-muted-foreground">
                Please log in to submit your response.
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {canSubmit ? (
              <>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Submitting..." : "Submit"}
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard/surveys">Cancel</Link>
                </Button>
              </>
            ) : null}

            {!survey.is_anonymous && !isAuthenticated && !hasResponded && (
              <Button asChild>
                <Link href={`/login?next=/services/surveys/${survey.id}/respond`}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login to Respond
                </Link>
              </Button>
            )}

            {hasResponded && (
              <Button asChild variant="outline">
                <Link href="/dashboard/surveys">Back</Link>
              </Button>
            )}
          </div>
        </div>
      </fieldset>
    </form>
  );
}
