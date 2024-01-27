'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { loginSchema, loginType } from '@/lib/validations/auth';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginForm() {
  const router = useRouter();

  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  const form = useForm<loginType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const {
    formState: { errors, isSubmitting },
    setError,
  } = form;

  const [credentialsError, setCredentialsError] = useState('');

  const onSubmit = async (data: loginType) => {
    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    setCredentialsError('');

    console.log(res);

    // if (res?.error) {
    //   setCredentialsError('Invalid credentials');
    //   console.log(res.error);
    // } else {
    //   router.push('/dashboard');
    // }
  };

  return (
    <Card className='w-[24rem]'>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Don't have an account?{' '}
          <Link href={'/register'} className='text-blue-500 font-medium'>
            Sign up
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type='email' placeholder='jdoe@gmail.com' {...field} />
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
                    <Input type='password' placeholder='********' {...field} />
                  </FormControl>
                  <FormMessage className='text-[0.8rem]' /> {/* Form error */}
                </FormItem>
              )}
            />
            {credentialsError && (
              <p className='text-destructive text-xs mt-0'>{credentialsError}</p>
            )}

            <div className='flex flex-col gap-6'>
              <Button disabled={isSubmitting} type='submit' className='w-full'>
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
                  <Loader2 className='animate-spin h-5 w-5' />
                ) : (
                  <FcGoogle className='h-5 w-5' />
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
