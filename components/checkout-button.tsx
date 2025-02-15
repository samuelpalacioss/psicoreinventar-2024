'use client';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Icons } from '@/components/icons';
import { useState } from 'react';

interface ButtonCheckoutProps extends React.HTMLAttributes<HTMLButtonElement> {
  text: string;
  stripeId: string;
  priceId: string;
}

export default function ButtonCheckout({
  className,
  text,
  stripeId,
  priceId,
  ...props
}: ButtonCheckoutProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const createCheckout = async () => {
    setIsLoading(!isLoading);

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stripeId, priceId }),
    });

    const data = await response.json(); // Receive checkout session url
    window.location.href = data.url;
  };

  return (
    <Button
      className={cn(className, 'w-full')}
      disabled={isLoading}
      onClick={() => {
        createCheckout();
      }}
      {...props}
    >
      {text}
      {isLoading && <Icons.spinner className='ml-2 h-5 w-5 animate-spin' />}
    </Button>
  );
}
