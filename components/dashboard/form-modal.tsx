"use client";

import type React from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ============================================================================
// FORM MODAL
// For add / edit modals that own a TanStack Form instance.
//
// Usage:
//   const form = useForm({ ... })
//   const [serverError, setServerError] = useState<string | null>(null)
//
//   <FormModal
//     title="Add patient"
//     description="Fill in the patient's details."
//     open={open}
//     onOpenChange={onOpenChange}
//     onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}
//     onReset={() => { form.reset(); setServerError(null) }}
//     submitLabel="Add patient"
//     isSubmitting={form.state.isSubmitting}
//     canSubmit={form.state.canSubmit}
//     serverError={serverError}
//   >
//     {/* form.Field blocks */}
//   </FormModal>
// ============================================================================

interface FormModalProps {
  title: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the native form submit event. Run e.preventDefault() + form.handleSubmit() here. */
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  /** Called when the dialog closes. Use it to reset form state and clear server errors. */
  onReset?: () => void;
  /** Text for the submit button. Defaults to "Save changes". */
  submitLabel?: string;
  /** form.state.isSubmitting from TanStack Form. */
  isSubmitting: boolean;
  /** form.state.canSubmit from TanStack Form. */
  canSubmit: boolean;
  serverError?: string | null;
  successMessage?: string | null;
  children: React.ReactNode;
}

export function FormModal({
  title,
  description,
  open,
  onOpenChange,
  onSubmit,
  onReset,
  submitLabel = "Save changes",
  isSubmitting,
  canSubmit,
  serverError,
  successMessage,
  children,
}: FormModalProps) {
  function handleOpenChange(val: boolean) {
    if (!val) onReset?.();
    onOpenChange(val);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <FieldGroup className="gap-5">
            {children}

            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}
            {successMessage && (
              <p className="text-sm text-green-600">{successMessage}</p>
            )}
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              <span className="flex items-center gap-2">
                {submitLabel}
                {isSubmitting && (
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                )}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
