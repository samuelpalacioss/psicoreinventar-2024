import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Icons } from "./icons";
import Link from "next/link";
import { UseFormReturn, FieldValues, Path } from "react-hook-form";

// TODO: When making the post request to the api, send that the role by default will be client/patient

interface SignupFormProps<T extends FieldValues> extends React.ComponentProps<"div"> {
  form?: UseFormReturn<T>;
  variant?: "card" | "inline";
  onGoogleAuth?: () => void;
}

export default function SignupForm<T extends FieldValues>({
  className,
  form,
  variant = "card",
  onGoogleAuth,
  ...props
}: SignupFormProps<T>) {
  const isInline = variant === "inline";
  const isCard = variant === "card";

  const FormFields = (
    <FieldGroup className="gap-4">
      <Field>
        <FieldLabel htmlFor="fullName" className="font-medium text-gray-900">
          Full name
        </FieldLabel>
        <Input
          id="fullName"
          type="text"
          placeholder="John Doe"
          required={!form}
          {...(form ? form.register("fullName" as Path<T>) : {})}
        />
        {form?.formState.errors.fullName && (
          <p className="text-sm text-red-600 mt-1">
            {form.formState.errors.fullName.message as string}
          </p>
        )}
      </Field>
      <Field>
        <FieldLabel htmlFor="email" className="font-medium text-gray-900">
          Email
        </FieldLabel>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          required={!form}
          {...(form ? form.register("email" as Path<T>) : {})}
        />
        {form?.formState.errors.email && (
          <p className="text-sm text-red-600 mt-1">
            {form.formState.errors.email.message as string}
          </p>
        )}
      </Field>
      <Field>
        <FieldLabel htmlFor="password" className="font-medium text-gray-900">
          Password
        </FieldLabel>
        <Input
          id="password"
          type="password"
          placeholder="********"
          required={!form}
          {...(form ? form.register("password" as Path<T>) : {})}
        />
        {form?.formState.errors.password && (
          <p className="text-sm text-red-600 mt-1">
            {form.formState.errors.password.message as string}
          </p>
        )}
      </Field>
      <Field>
        <FieldLabel htmlFor="confirmPassword" className="font-medium text-gray-900">
          Confirm password
        </FieldLabel>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="********"
          required={!form}
          {...(form ? form.register("confirmPassword" as Path<T>) : {})}
        />
        {form?.formState.errors.confirmPassword && (
          <p className="text-sm text-red-600 mt-1">
            {form.formState.errors.confirmPassword.message as string}
          </p>
        )}
      </Field>
      {!isInline && (
        <Field className="pt-2">
          <Button type="submit" className="w-full">
            Sign up
          </Button>
        </Field>
      )}
      <FieldSeparator>Or continue with</FieldSeparator>
      <Field>
        <Button variant="outline" type="button" className="w-full" onClick={onGoogleAuth}>
          <Icons.google className="h-5 w-5" />
          Google
        </Button>
      </Field>
    </FieldGroup>
  );

  if (isInline) {
    return (
      <div className={cn("space-y-6", className)} {...props}>
        <div>
          <h3 className="text-2xl sm:text-3xl font-light text-gray-900 mb-2">
            Create your account
          </h3>
          {isCard && (
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                Sign in
              </Link>
            </p>
          )}
        </div>
        <div className="max-w-md">{FormFields}</div>
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
        <CardContent>
          <form>{FormFields}</form>
        </CardContent>
      </Card>
    </div>
  );
}
