"use client";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Icons } from "@/components/icons";
import { useState } from "react";
import { createCheckoutSession } from "@/actions/stripe";
import { toast } from "sonner";

interface ButtonCheckoutProps extends React.HTMLAttributes<HTMLButtonElement> {
  text: string;
  productId: string;
  priceId: string;
  dateTime?: string;
  doctorId?: string;
}

export default function ButtonCheckout({
  className,
  text,
  productId,
  priceId,
  dateTime,
  doctorId,
  ...props
}: ButtonCheckoutProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      const { url } = await createCheckoutSession({
        productId,
        priceId,
        dateTime,
        doctorId,
      });

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("[CHECKOUT_ERROR]", error);
      toast("An error occurred while checking out. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button className={cn(className, "w-full")} disabled={isLoading} onClick={handleCheckout} {...props}>
      {text}
      {isLoading && <Icons.spinner className="ml-2 h-5 w-5 animate-spin" />}
    </Button>
  );
}
