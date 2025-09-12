"use client"

import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

type Props = {
  displayText?: string;
  disabled?: boolean;
  overwritePending?: boolean;
}

export default function SubmitButton({ disabled, displayText = "Create", overwritePending }: Props) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled || overwritePending}>
      {pending ? "Creating..." : displayText}
    </Button>
  );
}
