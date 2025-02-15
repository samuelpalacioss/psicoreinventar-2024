'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { resetPasswordSchema, resetPasswordType } from '@/lib/validations/auth';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { useState, useTransition } from 'react';
import { resetPassword } from '@/actions/reset-password';
import FormsuccessMsg from './form-success-msg';
import FormErrorMessage from './form-error-msg';
import { cn } from '@/lib/utils';

export default function ResetPasswordForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<resetPasswordType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const {
    formState: { errors },
    setError,
  } = form;

  const [errorMsg, setErrorMsg] = useState<string | undefined>('');
  const [successMsg, setSuccessMsg] = useState<string | undefined>('');

  const onSubmit = async (data: resetPasswordType) => {
    setErrorMsg('');
    setSuccessMsg('');

    startTransition(() => {
      resetPassword(data).then((data) => {
        setErrorMsg(data?.error);
        setSuccessMsg(data?.success);
      });
    });
  };

  return (
    <Card className='w-[24rem]'>
      <CardHeader>
        <CardTitle>Forgot your password?</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='jdoe@gmail.com'
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className='text-[0.8rem]' /> {/* Form error */}
                </FormItem>
              )}
            />

            <FormErrorMessage message={errorMsg} />
            <FormsuccessMsg message={successMsg} />
            <div className='flex flex-col gap-6'>
              <Button disabled={isPending} type='submit' className='w-full'>
                Send reset email
              </Button>
              <Link href='/login' className={cn(buttonVariants({ variant: 'link' }))}>
                <Icons.chevronLeft className='mr-2 h-4 w-4' />
                Back to login
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
