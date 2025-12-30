"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Icons } from "@/components/icons";
import FormsuccessMsg from "./form-success-msg";
import FormErrorMessage from "./form-error-msg";
import { cn } from "@/lib/utils";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      // TODO: Make POST request to API
      console.log({ email });
      setSuccessMsg("Reset email sent successfully");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[24rem]">
      <CardHeader>
        <CardTitle className="text-2xl text-gray-900 mb-2 font-medium leading-tight">
          Forgot your password?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-900">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <FormErrorMessage message={errorMsg} />
          <FormsuccessMsg message={successMsg} />
          <div className="flex flex-col gap-6">
            <Button disabled={isLoading} type="submit" className="w-full">
              {isLoading ? "Sending..." : "Send reset email"}
            </Button>
            <Link href="/login" className={cn(buttonVariants({ variant: "link" }))}>
              Back to login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
