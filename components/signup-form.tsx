import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Icons } from "./icons";
import Link from "next/link";

// TODO: When making the post request to the api, send that the role by default will be client/patient

export default function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
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
          <form>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="name" className="font-medium text-gray-900">
                  Full name
                </FieldLabel>
                <Input id="name" type="text" placeholder="John Doe" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="email" className="font-medium text-gray-900">
                  Email
                </FieldLabel>
                <Input id="email" type="email" placeholder="your@email.com" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="password" className="font-medium text-gray-900">
                  Password
                </FieldLabel>
                <Input id="password" type="password" placeholder="********" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-password" className="font-medium text-gray-900">
                  Confirm password
                </FieldLabel>
                <Input id="confirm-password" type="password" placeholder="********" required />
              </Field>
              <Field className="pt-2">
                <Button type="submit" className="w-full">
                  Sign up
                </Button>
              </Field>
              <FieldSeparator>Or continue with</FieldSeparator>
              <Field>
                <Button variant="outline" type="button" className="w-full">
                  <Icons.google className="h-5 w-5" />
                  Google
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
