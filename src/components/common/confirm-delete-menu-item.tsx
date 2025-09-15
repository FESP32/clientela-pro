// components/common/confirm-delete-menu-item.tsx
"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

type Mode = "menu" | "button";

type Props = {
  action: (formData: FormData) => Promise<void>;
  hiddenFields?: Record<string, string>;

  /** Trigger label */
  label?: string;

  /** Dialog copy */
  title?: string;
  description?: string;
  confirmLabel?: string;
  resourceLabel?: string;

  /** When true (default), use non-modal dialog to avoid inert bugs when launched from dropdowns */
  nonModal?: boolean;

  /** Extra classes for the trigger (menu item or button) */
  className?: string;

  /** Render as a dropdown menu item or a regular button (default: "menu") */
  mode?: Mode;

  /** Button-only: customize trigger appearance */
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
  buttonSize?: React.ComponentProps<typeof Button>["size"];
};

function ConfirmSubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="destructive"
      disabled={pending}
      className="gap-2"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      {pending ? "Deleting…" : children}
    </Button>
  );
}

export function ConfirmDeleteMenuItem({
  action,
  hiddenFields,
  label = "Delete",
  title = "Delete item",
  description = "This action cannot be undone. This will permanently delete the item.",
  confirmLabel = "Delete",
  resourceLabel,
  className,
  mode = "menu",
  buttonVariant = "outline",
  buttonSize = "sm",
}: Props) {
  const [open, setOpen] = React.useState(false);

  const openDialog = () => setOpen(true);

  // For dropdown: prevent the menu from closing so dialog stays mounted
  const onSelectMenuItem = (e: Event) => {
    e.preventDefault();
    // open after current tick to avoid focus flicker
    requestAnimationFrame(openDialog);
  };

  const Trigger =
    mode === "menu" ? (
      <DropdownMenuItem
        onSelect={onSelectMenuItem}
        className={
          "text-red-600 data-[highlighted]:bg-red-50 dark:data-[highlighted]:bg-red-950/30 " +
          (className ?? "")
        }
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {label}
      </DropdownMenuItem>
    ) : (
      <Button
        type="button"
        onClick={openDialog}
        variant={buttonVariant}
        size={buttonSize}
        className={className}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {label}
      </Button>
    );

  return (
    <>
      {Trigger}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>
              {description}
              {resourceLabel ? (
                <>
                  {" "}
                  <span className="font-medium text-foreground">
                    “{resourceLabel}”
                  </span>
                  .
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <form action={action}>
            {hiddenFields &&
              Object.entries(hiddenFields).map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
              ))}
            <AlertDialogFooter>
              <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
              <ConfirmSubmitButton>{confirmLabel}</ConfirmSubmitButton>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
