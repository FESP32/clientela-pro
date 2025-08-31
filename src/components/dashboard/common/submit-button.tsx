"use client"

import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

type Props = {
  disabled?: boolean;
}

export default function SubmitButton({ disabled }: Props) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? "Creating..." : "Create"}
    </Button>
  );
}
