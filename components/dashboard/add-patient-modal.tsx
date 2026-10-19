"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { addPatientSchema } from "@/lib/schema";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { ActionNewButton } from "@/components/dashboard/action-new-button";
import { FormModal } from "@/components/dashboard/form-modal";

// ============================================================================
// MODAL
// ============================================================================

interface AddPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPatientModal({ open, onOpenChange }: AddPatientModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      firstName: "",
      middleName: "",
      firstLastName: "",
      secondLastName: "",
      email: "",
      ci: "",
      birthDate: "",
      phoneAreaCode: "",
      phoneNumber: "",
      address: "",
    },
    validators: {
      onChange: addPatientSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      // TODO: wire up server action
      console.log("Add patient:", value);
      form.reset();
      onOpenChange(false);
    },
  });

  return (
    <FormModal
      title="Add patient"
      description="Register a new patient to your practice."
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
      submitLabel="Add patient"
      isSubmitting={form.state.isSubmitting}
      canSubmit={form.state.canSubmit}
      serverError={serverError}
    >
      {/* Name */}
      <div className="grid grid-cols-2 gap-3">
        <form.Field name="firstName">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  First name <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="Maria"
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

        <form.Field name="middleName">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Middle name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="Elena"
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
      </div>

      {/* Last name */}
      <div className="grid grid-cols-2 gap-3">
        <form.Field name="firstLastName">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  First last name <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="Torres"
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

        <form.Field name="secondLastName">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Second last name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="García"
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
      </div>

      {/* Email */}
      <form.Field name="email">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>
                Email <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="email"
                placeholder="patient@email.com"
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

      {/* CI + Birth date */}
      <div className="grid grid-cols-2 gap-3">
        <form.Field name="ci">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Cédula (CI) <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="12345678"
                  maxLength={8}
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

        <form.Field name="birthDate">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Date of birth <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="date"
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
      </div>

      {/* Phone */}
      <div className="flex gap-3">
        <form.Field name="phoneAreaCode">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid} className="w-28 shrink-0">
                <FieldLabel htmlFor={field.name}>
                  Area code <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="412"
                  maxLength={4}
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

        <form.Field name="phoneNumber">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid} className="flex-1">
                <FieldLabel htmlFor={field.name}>
                  Phone number <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="1234567"
                  maxLength={7}
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
      </div>

      {/* Address */}
      <form.Field name="address">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>
                Address <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="text"
                placeholder="Av. Principal, Caracas"
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
// TRIGGER — pass as the `actions` prop in the patients page
// ============================================================================

export function NewPatientButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ActionNewButton label="New patient" icon="plus" onClick={() => setOpen(true)} />
      <AddPatientModal open={open} onOpenChange={setOpen} />
    </>
  );
}
