"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { editAppointmentSchema } from "@/lib/schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { FormModal } from "@/components/dashboard/form-modal";
import { updateAppointmentAction } from "@/actions/appointments";
import { useState } from "react";
import type { Appointment } from "@/components/dashboard/appointments-columns";
import { AppointmentStatus } from "@/src/types";

// Helpers for date/time inputs (aligned with add-appointment-modal)
function formatDateForInput(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatTimeForInput(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

// Interprets the date + time inputs in the browser's time zone, i.e. the instant the user picked.
function toLocalDateTime(startDate: string, startTime: string) {
  return new Date(`${startDate}T${startTime}`);
}

function isDateTimeInPast(startDate: string, startTime: string) {
  if (!startDate || !startTime) return false;
  const selectedDateTime = toLocalDateTime(startDate, startTime);
  if (Number.isNaN(selectedDateTime.getTime())) return false;
  return selectedDateTime < new Date();
}

// Business rule: date/time can only be changed when status is scheduled or confirmed.
function canEditDateTime(status: string) {
  return status === "scheduled" || status === "confirmed";
}

interface EditAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
}

export function EditAppointmentModal({
  open,
  onOpenChange,
  appointment,
}: EditAppointmentModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const startDate = appointment ? formatDateForInput(new Date(appointment.startDateTime)) : "";
  const startTime = appointment ? formatTimeForInput(new Date(appointment.startDateTime)) : "";

  const form = useForm({
    defaultValues: {
      appointmentId: appointment?.id ?? 0,
      startDate,
      startTime,
      status: (appointment?.status ?? "scheduled") as "scheduled" | "confirmed" | "completed" | "cancelled",
      notes: appointment?.notes ?? "",
    },
    validators: {
      onChange: editAppointmentSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      if (canEditDateTime(value.status) && isDateTimeInPast(value.startDate, value.startTime)) {
        setServerError("New date and time must be in the future");
        return;
      }

      const result = await updateAppointmentAction({
        appointmentId: value.appointmentId,
        startDateTime: toLocalDateTime(value.startDate, value.startTime).toISOString(),
        status: value.status,
        notes: value.notes,
      });
      if (result.error) {
        setServerError(result.error);
        return;
      }
      onOpenChange(false);
    },
  });

  const now = new Date();
  const minDate = formatDateForInput(now);
  const minTimeForToday = formatTimeForInput(now);
  const { startDate: formStartDate, startTime: formStartTime, status } = useStore(form.store, (s) => s.values);
  const dateTimeEditable = canEditDateTime(status);
  const isPastDateTimeSelection = dateTimeEditable && isDateTimeInPast(formStartDate, formStartTime);
  const canSubmit =
    formStartDate.length > 0 &&
    formStartTime.length > 0 &&
    !isPastDateTimeSelection;

  if (!appointment) return null;

  return (
    <FormModal
      title="Edit appointment"
      description="Change date, time, status, or notes. Date and time can only be changed for scheduled or confirmed appointments."
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={async (e) => {
        e.preventDefault();
        await form.handleSubmit();
      }}
      onReset={() => {
        form.reset();
        setServerError(null);
      }}
      submitLabel="Save changes"
      isSubmitting={form.state.isSubmitting}
      canSubmit={canSubmit}
      serverError={serverError}
    >
      {/* Date + Time — disabled when status is completed or cancelled */}
      <div className="grid grid-cols-2 gap-3">
        <form.Field name="startDate">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Date <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="date"
                  min={dateTimeEditable ? minDate : undefined}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  disabled={form.state.isSubmitting || !dateTimeEditable}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="startTime">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Time <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="time"
                  min={dateTimeEditable && formStartDate === minDate ? minTimeForToday : undefined}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  disabled={form.state.isSubmitting || !dateTimeEditable}
                />
                {dateTimeEditable && isPastDateTimeSelection && (
                  <p className="text-sm text-destructive">New time must be in the future</p>
                )}
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
      </div>

      {/* Status */}
      <form.Field name="status">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel>
                Status <span className="text-destructive">*</span>
              </FieldLabel>
              <Select
                value={field.state.value}
                onValueChange={(value) => {
                  field.handleChange(value as typeof field.state.value);
                  field.handleBlur();
                }}
                disabled={form.state.isSubmitting}
              >
                <SelectTrigger aria-invalid={isInvalid}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(AppointmentStatus) as Array<[keyof typeof AppointmentStatus, string]>).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      {/* Notes */}
      <form.Field name="notes">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Notes</FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                placeholder="Session topics, any info that might be helpful for the therapist..."
                rows={3}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                disabled={form.state.isSubmitting}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>
    </FormModal>
  );
}
