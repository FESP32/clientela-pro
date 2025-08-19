"use client";

import SmileyRespond from "@/components/services/smiley-survey";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { Trait } from "@/types";

export type Survey = {
  id: string;
  title: string;
  description?: string | null;
  traits: Trait[];
  is_anonymous: boolean;
};

type Props = {
  survey: Survey;
  isAuthenticated: boolean; // passed from server
  hasResponded: boolean; // 👈 NEW: passed from server
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

  const handleSubmit = (formData: FormData) => {
    if (submitted || hasResponded) return; // prevent double/duplicate submits

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

  const formDisabled = submitted || isPending || hasResponded;
  const requiresAuth = !survey.is_anonymous;

  // Only allow submit when:
  // - not submitted yet
  // - user hasn't already responded
  // - (anonymous survey) OR (non-anonymous & user is authenticated)
  const canSubmit =
    !submitted &&
    !hasResponded &&
    (survey.is_anonymous || (requiresAuth && isAuthenticated));

  return (
    <form action={handleSubmit} className="p-4">
      <input type="hidden" name="survey_id" value={survey.id} />

      <fieldset disabled={formDisabled} aria-busy={isPending}>
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>{survey.title}</CardTitle>
            {survey.description && (
              <p className="text-sm text-muted-foreground">
                {survey.description}
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Hide the smileys if the user already responded */}
            {!hasResponded && (
              <SmileyRespond
                surveyTitle={survey.title}
                traits={survey.traits}
              />
            )}

            {hasResponded && (
              <p className="text-sm text-muted-foreground" aria-live="polite">
                You’ve already responded to this survey.
              </p>
            )}

            {submitted && !hasResponded && (
              <p className="text-sm text-muted-foreground" aria-live="polite">
                Thanks! Your response has been recorded.
              </p>
            )}

            {/* For non-anonymous surveys where the user isn't logged in, keep smileys visible
                (preview) but inform they must log in to submit */}
            {!survey.is_anonymous && !isAuthenticated && !hasResponded && (
              <p className="text-sm text-muted-foreground">
                Please log in to submit your response.
              </p>
            )}
          </CardContent>

          <CardFooter className="flex gap-2">
            {/* Show Submit/Cancel only when the user can actually submit */}
            {canSubmit && (
              <>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Submitting..." : "Submit"}
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard/surveys">Cancel</Link>
                </Button>
              </>
            )}

            {/* Non-anonymous + not authenticated: show login button (submit/cancel hidden) */}
            {!survey.is_anonymous && !isAuthenticated && !hasResponded && (
              <Button asChild>
                <Link href="/login">Login to Respond</Link>
              </Button>
            )}

            {/* If already responded, no submit/cancel; offer a way back */}
            {hasResponded && (
              <Button asChild variant="outline">
                <Link href="/dashboard/surveys">Back</Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </fieldset>
    </form>
  );
}
