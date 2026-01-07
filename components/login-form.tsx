"use client";

import { useForm } from "@tanstack/react-form";
import { signInSchema } from "@/lib/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Icons } from "./icons";
import Link from "next/link";
import { signInAction } from "@/actions/auth";
import { socialSignIn } from "@/lib/auth/social-sign-in";

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

interface LoginFormProps extends React.ComponentProps<"div"> {
  onGoogleAuth?: () => void;
}

export default function LoginForm({ className, onGoogleAuth, ...props }: LoginFormProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: signInSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);

      const formData = new FormData();
      formData.append("email", value.email);
      formData.append("password", value.password);

      const result = await signInAction(formData);

      if (result?.error) {
        setServerError(result.error);
      }
    },
  });

  const isLoading = form.state.isSubmitting || isGoogleLoading;

  async function handleGoogleAuth() {
    setServerError(null);
    setIsGoogleLoading(true);
    try {
      await socialSignIn("google");
      // await onGoogleAuth?.();
    } catch (error) {
      setServerError(error as string);
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

        {serverError && <div className="text-sm font-medium text-destructive">{serverError}</div>}

        <div className="pt-2">
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button type="submit" className="w-full" disabled={!canSubmit}>
                <span className="flex items-center gap-2">
                  Sign in
                  {isSubmitting && <Icons.spinner className="h-5 w-5 animate-spin" />}
                </span>
              </Button>
            )}
          />
        </div>

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

  return (
    <div className={cn("flex flex-col w-full max-w-sm sm:max-w-md", className)} {...props}>
      <Card className="w-full">
        <CardHeader>
          <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2 leading-tight">Welcome back!</h1>
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Sign up
            </Link>
          </p>
        </CardHeader>
        <CardContent>{formContent}</CardContent>
      </Card>
    </div>
  );
}
