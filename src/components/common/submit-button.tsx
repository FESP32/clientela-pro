"use client"

import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

type Props = {
  displayText?: string;
  disabled?: boolean;
}

export default function SubmitButton({ disabled, displayText = "Create" }: Props) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? "Creating..." : displayText}
    </Button>
  );
}
