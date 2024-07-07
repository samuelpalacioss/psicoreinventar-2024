'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { loginSchema, loginType } from '@/lib/validations/auth';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { signIn } from 'next-auth/react';
import { useState, useTransition } from 'react';
import { login } from '@/actions/login';
import FormsuccessMsg from './form-success-msg';

export default function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  const form = useForm<loginType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const {
    formState: { errors },
    setError,
  } = form;

  const [errorMsg, setErrorMsg] = useState<string | undefined>('');
  const [successMsg, setSuccessMsg] = useState<string | undefined>('');

  const onSubmit = async (data: loginType) => {
    setErrorMsg('');
    setSuccessMsg('');

    startTransition(() => {
      login(data).then((data) => {
        setErrorMsg(data.error ?? '');
        setSuccessMsg(data.success ?? '');
      });
    });
  };

  return (
    <Card className='w-[24rem]'>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Don&apos;t have an account?{' '}
          <Link href={'/register'} className='text-blue-500 font-medium'>
            Sign up
          </Link>
        </CardDescription>
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
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='********' disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage className='text-[0.8rem]' /> {/* Form error */}
                </FormItem>
              )}
            />

            {errorMsg && <p className='text-destructive text-xs mt-0'>{errorMsg}</p>}
            <FormsuccessMsg message={successMsg} />
            <div className='flex flex-col gap-6'>
              <Button disabled={isPending} type='submit' className='w-full'>
                Sign in with email
              </Button>
              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <span className='w-full border-t' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-background px-2 text-muted-foreground'>Or continue with</span>
                </div>
              </div>
              <Button
                type='button'
                variant='outline'
                disabled={isGoogleLoading}
                className='gap-2'
                onClick={() => {
                  setIsGoogleLoading(true);
                  signIn('google', { callbackUrl: '/dashboard' });
                }}
              >
                {isGoogleLoading ? (
                  <Icons.spinner className='animate-spin h-5 w-5' />
                ) : (
                  <Icons.google className='h-5 w-5' />
                )}
                {''}
                Google
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
