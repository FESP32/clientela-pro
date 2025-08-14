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
};

type Props = {
  survey: Survey;
  onSubmit: (
    formData: FormData
  ) => Promise<{ success: boolean; message: string }>;
};

export default function RespondForm({ survey, onSubmit }: Props) {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (formData: FormData) => {
    if (submitted) return; // guard against double-submits after success

    startTransition(async () => {
      const result = await onSubmit(formData);

      if (result.success) {
        setSubmitted(true);
        toast.success(result.message || "Response submitted!", {

        });
      } else {
        toast.error(result.message || "Something went wrong.");
      }
    });
  };


  const formDisabled = submitted || isPending;


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
            <SmileyRespond surveyTitle={survey.title} traits={survey.traits} />
            {submitted && (
              <p className="text-sm text-muted-foreground" aria-live="polite">
                Thanks! Your response has been recorded.
              </p>
            )}
          </CardContent>

          {!submitted && (
            <CardFooter className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Submitting..." : "Submit"}
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/surveys">Cancel</Link>
              </Button>
            </CardFooter>
          )}
        </Card>
      </fieldset>
    </form>
  );
}
