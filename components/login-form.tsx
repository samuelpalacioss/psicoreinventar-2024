import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Icons } from "./icons";
import Link from "next/link";

export default function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col w-full max-w-md", className)} {...props}>
      <Card className="w-full">
        <CardHeader>
          <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2 leading-tight">Welcome back!</h1>
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Sign up
            </Link>
          </p>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email" className="font-medium text-gray-900">
                  Email
                </FieldLabel>
                <Input id="email" type="email" placeholder="your@email.com" required />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="font-medium text-gray-900">
                    Password
                  </FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm text-gray-500 font-light hover:text-gray-700"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input id="password" type="password" placeholder="********" required />
              </Field>
              <Field className="pt-2">
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </Field>
              <FieldSeparator>Or continue with</FieldSeparator>
              <Field>
                <Button variant="outline" type="button" className="w-full">
                  <Icons.google className="h-5 w-5" />
                  Login with Google
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
