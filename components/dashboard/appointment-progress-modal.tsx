"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { Icons } from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { Appointment } from "@/components/dashboard/appointments-columns";

type ProgressModalMode = "view" | "edit";

interface ProgressPayload {
  title: string;
  level: string;
  notes: string;
}

interface AppointmentProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  mode: ProgressModalMode;
  onSaved?: () => void;
}

function ProgressSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong while saving progress";
}

export function AppointmentProgressModal({
  open,
  onOpenChange,
  appointment,
  mode,
  onSaved,
}: AppointmentProgressModalProps) {
  const isEditMode = mode === "edit";
  const hasProgress = Boolean(appointment?.progressId);
  const canEdit = isEditMode && Boolean(appointment) && hasProgress;

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [values, setValues] = useState<ProgressPayload>({
    title: "",
    level: "",
    notes: "",
  });

  const modalTitle = useMemo(() => {
    if (isEditMode) return "Edit progress";
    return "Progress details";
  }, [isEditMode]);

  useEffect(() => {
    if (!open || !appointment) return;

    if (!appointment.progressId) {
      setValues({
        title: "",
        level: "",
        notes: "",
      });
      setServerError(null);
      return;
    }

    let isMounted = true;

    async function loadProgress() {
      try {
        setIsLoading(true);
        setServerError(null);

        const response = await fetch(`/api/progresses/${appointment?.progressId}`, {
          method: "GET",
          credentials: "include",
        });
        const payload = await response.json();

        if (!response.ok || !payload?.success || !payload?.data) {
          throw new Error(payload?.error?.message || "Could not load progress details");
        }

        if (!isMounted) return;

        setValues({
          title: payload.data.title || "",
          level: payload.data.level || "",
          notes: payload.data.notes || "",
        });
      } catch (error) {
        if (!isMounted) return;
        setServerError(getErrorMessage(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadProgress();

    return () => {
      isMounted = false;
    };
  }, [open, appointment]);

  async function handleSave() {
    if (!appointment?.progressId || !canEdit) return;
    if (!values.title.trim()) {
      setServerError("Progress title is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setServerError(null);

      const response = await fetch(`/api/progresses/${appointment.progressId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId: appointment.id,
          title: values.title.trim(),
          level: values.level || undefined,
          notes: values.notes.trim() || undefined,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error?.message || "Could not update progress");
      }

      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      setServerError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>
            {appointment
              ? `Appointment #${appointment.id} - ${appointment.patientName}`
              : "Progress details"}
          </DialogDescription>
        </DialogHeader>

        {!appointment ? null : isLoading ? (
          <ProgressSkeleton />
        ) : !hasProgress ? (
          <p className="text-sm text-muted-foreground">No progress has been recorded for this appointment yet.</p>
        ) : (
          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor="progress-title">Title</FieldLabel>
              <Input
                id="progress-title"
                value={values.title}
                onChange={(e) => setValues((prev) => ({ ...prev, title: e.target.value }))}
                disabled={!canEdit || isSubmitting}
              />
            </Field>

            <Field>
              <FieldLabel>Level</FieldLabel>
              <Select
                value={values.level || ""}
                onValueChange={(value) => setValues((prev) => ({ ...prev, level: value }))}
                disabled={!canEdit || isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="great">Great</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="progress-notes">Notes</FieldLabel>
              <Textarea
                id="progress-notes"
                rows={4}
                value={values.notes}
                onChange={(e) => setValues((prev) => ({ ...prev, notes: e.target.value }))}
                disabled={!canEdit || isSubmitting}
              />
            </Field>
          </div>
        )}

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Close
          </Button>
          {canEdit && (
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting || !values.title.trim()}
            >
              <span className="flex items-center gap-2">
                Save changes
                {isSubmitting && <Icons.spinner className="h-4 w-4 animate-spin" />}
              </span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
