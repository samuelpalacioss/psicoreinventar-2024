"use client";

import { useMemo, useState } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { addAppointmentSchema } from "@/lib/schema";
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
import { ActionNewButton } from "@/components/dashboard/action-new-button";
import { FormModal } from "@/components/dashboard/form-modal";
import { Service } from "@/src/types";
import { createAppointmentAction } from "@/actions/appointments";

// ============================================================================
// MODAL
// ============================================================================

interface AddAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: AppointmentPatientOption[];
  services: AppointmentServiceOption[];
}

export interface AppointmentPatientOption {
  patientId: number;
  patientCi: number;
  firstName: string;
  middleName: string | null;
  firstLastName: string;
  secondLastName: string | null;
}

export interface AppointmentServiceOption {
  serviceId: number;
  doctorId: number;
  amount: number;
  serviceName: keyof typeof Service;
}

function formatPatientName(patient: AppointmentPatientOption) {
  return [
    patient.firstName,
    patient.middleName,
    patient.firstLastName,
    patient.secondLastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatPatientOptionLabel(patient: AppointmentPatientOption) {
  return `${formatPatientName(patient)} - ${patient.patientCi}`;
}

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatServiceAmount(amount: number) {
  return amount.toFixed(2);
}

function formatServiceLabel(serviceName: AppointmentServiceOption["serviceName"]) {
  return Service[serviceName];
}

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

export function AddAppointmentModal({
  open,
  onOpenChange,
  patients,
  services,
}: AddAppointmentModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const now = new Date();
  const minDate = formatDateForInput(now);
  const minTimeForToday = formatTimeForInput(now);
  const filteredPatients = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(patientSearch);
    if (!normalizedSearch) return patients;
    return patients.filter((patient) =>
      normalizeSearchValue(formatPatientOptionLabel(patient)).includes(normalizedSearch)
    );
  }, [patients, patientSearch]);

  const form = useForm({
    defaultValues: {
      patientId: "",
      serviceId: "",
      startDate: "",
      startTime: "",
      paymentAmount: "",
      notes: "",
    },
    validators: {
      onChange: addAppointmentSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      if (isDateTimeInPast(value.startDate, value.startTime)) {
        setServerError("Time cannot be in the past");
        return;
      }

      const { startDate, startTime, ...rest } = value;
      const result = await createAppointmentAction({
        ...rest,
        startDateTime: toLocalDateTime(startDate, startTime).toISOString(),
      });
      if (result.error) {
        setServerError(result.error);
        return;
      }
      console.log("Added appointment: ", value);
      form.reset();
      onOpenChange(false);
    },
  });

  const { startDate, startTime, patientId, serviceId, paymentAmount } = useStore(
    form.store,
    (s) => s.values
  );
  const isPastDateTimeSelection = isDateTimeInPast(startDate, startTime);
  const canSubmitAppointment =
    patientId.length > 0 &&
    serviceId.length > 0 &&
    startDate.length > 0 &&
    startTime.length > 0 &&
    paymentAmount.length > 0 &&
    !isPastDateTimeSelection;

  return (
    <FormModal
      title="New appointment"
      description="Schedule a new appointment for a patient."
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={async (e) => {
        e.preventDefault();
        await form.handleSubmit();
      }}
      onReset={() => {
        form.reset();
        setServerError(null);
        setPatientSearch("");
      }}
      submitLabel="Schedule appointment"
      isSubmitting={form.state.isSubmitting}
      canSubmit={canSubmitAppointment}
      serverError={serverError}
    >
      {/* Patient */}
      <form.Field name="patientId">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel>
                Patient <span className="text-destructive">*</span>
              </FieldLabel>
              <Select
                value={field.state.value}
                onValueChange={(value) => {
                  field.handleChange(value);
                  field.handleBlur();
                }}
                disabled={form.state.isSubmitting}
              >
                <SelectTrigger aria-invalid={isInvalid}>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      type="text"
                      placeholder="Search patient..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  {filteredPatients.length === 0 ? (
                    <div className="px-2 py-3 text-sm text-muted-foreground">
                      No patients found.
                    </div>
                  ) : (
                    filteredPatients.map((patient) => (
                      <SelectItem
                        key={patient.patientId}
                        value={String(patient.patientId)}
                        textValue={formatPatientOptionLabel(patient)}
                        itemLabel={formatPatientOptionLabel(patient)}
                      >
                        <div className="flex flex-col">
                          <span>{formatPatientName(patient)}</span>
                          <span className="text-xs text-gray-500">CI: {patient.patientCi}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      {/* Service */}
      <form.Field name="serviceId">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel>
                Service <span className="text-destructive">*</span>
              </FieldLabel>
              <Select
                value={field.state.value}
                onValueChange={(value) => {
                  field.handleChange(value);
                  field.handleBlur();
                  const service = services.find((item) => String(item.serviceId) === value);
                  form.setFieldValue(
                    "paymentAmount",
                    service ? formatServiceAmount(service.amount) : ""
                  );
                }}
                disabled={form.state.isSubmitting}
              >
                <SelectTrigger aria-invalid={isInvalid}>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem
                      key={service.serviceId}
                      value={String(service.serviceId)}
                      textValue={formatServiceLabel(service.serviceName)}
                    >
                      {formatServiceLabel(service.serviceName)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      {/* Date + Time */}
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
                  min={minDate}
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
                  min={
                    startDate === minDate
                      ? minTimeForToday
                      : undefined
                  }
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  disabled={form.state.isSubmitting}
                />
                {isPastDateTimeSelection && (
                  <p className="text-sm text-destructive">Time cannot be in the past</p>
                )}
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
      </div>

      {/* Payment amount */}
      <form.Field name="paymentAmount">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>
                Payment amount <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="text"
                placeholder="Select a service first"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                disabled
                readOnly
              />
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
                placeholder="Session topics, patient background..."
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

// ============================================================================
// TRIGGER — pass as the `actions` prop in the appointments page
// ============================================================================

interface NewAppointmentButtonProps {
  patients: AppointmentPatientOption[];
  services: AppointmentServiceOption[];
}

export function NewAppointmentButton({ patients, services }: NewAppointmentButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ActionNewButton label="New appointment" icon="plus" onClick={() => setOpen(true)} />
      <AddAppointmentModal
        open={open}
        onOpenChange={setOpen}
        patients={patients}
        services={services}
      />
    </>
  );
}
