"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { authClient } from "@/lib/auth/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { Icons } from "@/components/icons";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionNewButton } from "@/components/dashboard/action-new-button";
import { updatePersonalDetailsAction } from "@/actions/profile";

// ============================================================================
// SCHEMAS
// ============================================================================

// Name derived from persons table: firstName/middleName/firstLastName/secondLastName varchar(100)
const nameSchema = z
  .string()
  .min(1, { message: "Name is required" })
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, { message: "Letters only" })
  .refine((val) => val.trim().split(/\s+/).length >= 2, {
    message: "Include at least a first name and last name",
  })
  .refine((val) => val.trim().split(/\s+/).length <= 4, {
    message: "Too many name parts (max 4)",
  })
  .refine((val) => val.trim().split(/\s+/).every((p) => p.length <= 100), {
    message: "Each name part must be under 100 characters",
  });

// Birth date derived from persons.birthDate: date notNull
const personalDetailsSchema = z.object({
  name: nameSchema,
  phoneAreaCode: z
    .string()
    .min(1, { message: "Area code is required" })
    .regex(/^\d+$/, { message: "Digits only" }),
  phoneNumber: z
    .string()
    .min(1, { message: "Phone number is required" })
    .regex(/^\d+$/, { message: "Digits only" }),
  birthDate: z.string().min(1, { message: "Birth date is required" }),
});

// Email derived from users.email: text notNull unique
const emailSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
});

// Password derived from accounts.password: min 8 chars
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, { message: "At least 8 characters" }),
    newPassword: z.string().min(8, { message: "At least 8 characters" }),
    confirmPassword: z.string().min(8, { message: "At least 8 characters" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ============================================================================
// TYPES
// ============================================================================

interface ProfileSettingsProps {
  user: {
    name: string;
    email: string;
    phoneAreaCode?: number;
    phoneNumber?: number;
    birthDate?: string;
  };
}

// ============================================================================
// MODALS
// ============================================================================

function PersonalDetailsModal({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ProfileSettingsProps["user"];
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      name: user.name ?? "",
      phoneAreaCode: user.phoneAreaCode?.toString() ?? "",
      phoneNumber: user.phoneNumber?.toString() ?? "",
      birthDate: user.birthDate ?? "",
    },
    validators: {
      onChange: personalDetailsSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      setSuccessMessage(null);

      const result = await updatePersonalDetailsAction({
        name: value.name,
        phoneAreaCode: value.phoneAreaCode,
        phoneNumber: value.phoneNumber,
        birthDate: value.birthDate,
      });

      if (result.error) {
        setServerError(result.error);
        return;
      }

      setSuccessMessage("Personal details updated successfully.");
      onOpenChange(false);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          form.reset();
          setServerError(null);
          setSuccessMessage(null);
        }
        onOpenChange(val);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit personal details</DialogTitle>
          <DialogDescription>Update your name, phone number, and date of birth.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await form.handleSubmit();
          }}
        >
          <FieldGroup className="gap-5">
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Full name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="First name Last name"
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
            />

            <div className="flex gap-3">
              <form.Field
                name="phoneAreaCode"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid} className="w-24 shrink-0">
                      <FieldLabel htmlFor={field.name}>Area code</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        placeholder="0412"
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
              />

              <form.Field
                name="phoneNumber"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid} className="flex-1">
                      <FieldLabel htmlFor={field.name}>Phone number</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        placeholder="1234567"
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
              />
            </div>

            <form.Field
              name="birthDate"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Date of birth</FieldLabel>
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
            />

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={form.state.isSubmitting}
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit}>
                  <span className="flex items-center gap-2">
                    Save changes
                    {isSubmitting && <Icons.spinner className="h-4 w-4 animate-spin" />}
                  </span>
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EmailModal({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ProfileSettingsProps["user"];
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: user.email ?? "",
    },
    validators: {
      onChange: emailSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      setSuccessMessage(null);

      if (value.email === user.email) {
        setSuccessMessage("No changes to save.");
        return;
      }

      const { error } = await authClient.changeEmail({
        newEmail: value.email,
        callbackURL: "/dashboard/profile",
      });

      if (error) {
        setServerError(error.message ?? "Failed to update email.");
        return;
      }

      setSuccessMessage("A verification link has been sent to your new email address.");
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          form.reset();
          setServerError(null);
          setSuccessMessage(null);
        }
        onOpenChange(val);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change email address</DialogTitle>
          <DialogDescription>
            A verification link will be sent to the new address.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await form.handleSubmit();
          }}
        >
          <FieldGroup className="gap-5">
            <form.Field
              name="email"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>New email address</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="your@email.com"
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
            />

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={form.state.isSubmitting}
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit}>
                  <span className="flex items-center gap-2">
                    Update email
                    {isSubmitting && <Icons.spinner className="h-4 w-4 animate-spin" />}
                  </span>
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PasswordModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: {
      onChange: changePasswordSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      setSuccessMessage(null);

      const { error } = await authClient.changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
        revokeOtherSessions: false,
      });

      if (error) {
        setServerError(error.message ?? "Failed to change password.");
        return;
      }

      setSuccessMessage("Password changed successfully.");
      form.reset();
      onOpenChange(false);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          form.reset();
          setServerError(null);
          setSuccessMessage(null);
        }
        onOpenChange(val);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>Use a strong password of at least 8 characters.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await form.handleSubmit();
          }}
        >
          <FieldGroup className="gap-5">
            <form.Field
              name="currentPassword"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Current password</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      placeholder="••••••••"
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
            />

            <form.Field
              name="newPassword"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      placeholder="••••••••"
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
            />

            <form.Field
              name="confirmPassword"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Confirm new password</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      placeholder="••••••••"
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
            />

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={form.state.isSubmitting}
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit}>
                  <span className="flex items-center gap-2">
                    Update password
                    {isSubmitting && <Icons.spinner className="h-4 w-4 animate-spin" />}
                  </span>
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// DISPLAY CARDS
// ============================================================================

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [personalOpen, setPersonalOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const phoneDisplay =
    user.phoneAreaCode && user.phoneNumber
      ? `(0${user.phoneAreaCode}) ${user.phoneNumber}`
      : "Not set";

  const birthDateDisplay = user.birthDate
    ? new Date(user.birthDate + "T00:00:00").toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "Not set";

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Personal Details Card */}
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-lg font-medium">Personal details</CardTitle>
            <CardDescription className="mt-1">Your name, phone number, and date of birth.</CardDescription>
          </div>
          <ActionNewButton label="Edit" icon="edit" onClick={() => setPersonalOpen(true)} className="hidden sm:inline-flex shrink-0" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <InfoRow label="Full name" value={user.name} />
          <InfoRow label="Phone number" value={phoneDisplay} />
          <InfoRow label="Date of birth" value={birthDateDisplay} />
        </CardContent>
        <CardFooter className="sm:hidden">
          <ActionNewButton className="w-24" label="Edit" icon="edit" onClick={() => setPersonalOpen(true)} />
        </CardFooter>
      </Card>

      {/* Email Card */}
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-lg font-medium">Email address</CardTitle>
            <CardDescription className="mt-1">Changing your email will require verification.</CardDescription>
          </div>
          <ActionNewButton label="Edit" icon="edit" onClick={() => setEmailOpen(true)} className="hidden sm:inline-flex shrink-0" />
        </CardHeader>
        <CardContent>
          <InfoRow label="Email" value={user.email} />
        </CardContent>
        <CardFooter className="sm:hidden">
          <ActionNewButton className="w-24" label="Edit" icon="edit" onClick={() => setEmailOpen(true)} />
        </CardFooter>
      </Card>

      {/* Password Card */}
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-lg font-medium">Password</CardTitle>
            <CardDescription className="mt-1">Use a strong password of at least 8 characters.</CardDescription>
          </div>
          <ActionNewButton label="Edit" icon="edit" onClick={() => setPasswordOpen(true)} className="hidden sm:inline-flex shrink-0" />
        </CardHeader>
        <CardContent>
          <InfoRow label="Password" value="••••••••••••" />
        </CardContent>
        <CardFooter className="sm:hidden">
          <ActionNewButton className="w-24" label="Edit" icon="edit" onClick={() => setPasswordOpen(true)} />
        </CardFooter>
      </Card>

      {/* Modals */}
      <PersonalDetailsModal open={personalOpen} onOpenChange={setPersonalOpen} user={user} />
      <EmailModal open={emailOpen} onOpenChange={setEmailOpen} user={user} />
      <PasswordModal open={passwordOpen} onOpenChange={setPasswordOpen} />
    </div>
  );
}
