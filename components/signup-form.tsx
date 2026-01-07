"use client";

import { useForm } from "@tanstack/react-form";
import { signUpSchema } from "@/lib/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Icons } from "./icons";
import Link from "next/link";
import { signUpPatientAction } from "@/actions/auth";

const Separator = () => (
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t" />
    </div>
    <div className="relative flex justify-center text-xs uppercase">
      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
    </div>
  </div>
);

interface SignupFormProps extends React.ComponentProps<"div"> {
  variant?: "card" | "inline";
  onGoogleAuth?: () => void;
}

export default function SignupForm({
  className,
  variant = "card",
  onGoogleAuth,
  ...props
}: SignupFormProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);

      const formData = new FormData();
      formData.append("name", value.name);
      formData.append("email", value.email);
      formData.append("password", value.password);

      const result = await signUpPatientAction(formData);

      if (result?.error) {
        setServerError(result.error);
      }
    },
  });

  const isLoading = form.state.isSubmitting || isGoogleLoading;

  async function handleGoogleAuth() {
    setIsGoogleLoading(true);
    try {
      await onGoogleAuth?.();
    } finally {
      setIsGoogleLoading(false);
    }
  }

  const formContent = (
    <form
      id="signup-form"
      onSubmit={async (e) => {
        e.preventDefault();
        await form.handleSubmit();
      }}
    >
      <FieldGroup className="gap-4">
        <form.Field name="name">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name} className="font-medium text-gray-900">
                  Full name
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="John Doe"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  disabled={isLoading}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field
          name="email"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name} className="font-medium text-gray-900">
                  Email
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="your@email.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  disabled={isLoading}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="password"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name} className="font-medium text-gray-900">
                  Password
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  placeholder="********"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  disabled={isLoading}
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
                <FieldLabel htmlFor={field.name} className="font-medium text-gray-900">
                  Confirm password
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  placeholder="********"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  disabled={isLoading}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        {serverError && <div className="text-sm font-medium text-destructive">{serverError}</div>}

        {variant === "card" && (
          <div className="pt-2">
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" className="w-full" disabled={!canSubmit}>
                  <span className="flex items-center gap-2">
                    Sign up
                    {isSubmitting && <Icons.spinner className="h-5 w-5 animate-spin" />}
                  </span>
                </Button>
              )}
            />
          </div>
        )}

        <Separator />

        <Button
          variant="outline"
          type="button"
          className="w-full"
          onClick={handleGoogleAuth}
          disabled={isLoading}
        >
          {isGoogleLoading ? (
            <Icons.spinner className="mx-auto h-5 w-5 animate-spin text-primary" />
          ) : (
            <>
              <Icons.google className="h-5 w-5" />
              Google
            </>
          )}
        </Button>
      </FieldGroup>
    </form>
  );

  if (variant === "inline") {
    return (
      <div className={cn("space-y-6", className)} {...props}>
        <div>
          <h3 className="text-2xl sm:text-3xl font-light text-gray-900 mb-2">
            Create your account
          </h3>
        </div>
        <div className="max-w-md">{formContent}</div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col w-full max-w-sm sm:max-w-md", className)} {...props}>
      <Card className="w-full">
        <CardHeader>
          <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2 leading-tight">
            Create an account
          </h1>
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Sign in
            </Link>
          </p>
        </CardHeader>
        <CardContent>{formContent}</CardContent>
      </Card>
    </div>
  );
}
