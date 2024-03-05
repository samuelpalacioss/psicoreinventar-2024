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
import { signUpSchema, signUpType } from '@/lib/validations/auth';
import Link from 'next/link';
import { Icons } from './icons';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SignupForm() {
  const router = useRouter();

  const [showForm, setShowForm] = useState<boolean>(false);

  const form = useForm<signUpType>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'patient',
    },
  });

  const {
    formState: { errors, isSubmitting },
    setError,
  } = form;

  const onSubmit = async (data: signUpType) => {
    const res = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resData = await res.json();

    if (!res.ok) {
      console.error('Registration failed');
    } else {
      console.log('Successfully registered');
      router.push('/login');
    }

    if (resData.errors) {
      const errors = resData.errors;

      if (errors.email) {
        setError('email', {
          type: 'server',
          message: errors.email,
        });
      } else if (errors.password) {
        setError('password', {
          type: 'server',
          message: errors.password,
        });
      } else if (errors.confirmPassword) {
        setError('confirmPassword', {
          type: 'server',
          message: errors.confirmPassword,
        });
      } else {
        console.error('Registration failed');
      }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 0, y: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        type: 'spring',
      },
      y: 0,
      x: 0,
    },
  };

  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  return (
    <Card className='w-[24rem]'>
      <CardHeader>
        <CardTitle>Sign up</CardTitle>
        <CardDescription>
          Already have an account?{' '}
          <Link href={'/login'} className='text-blue-500 font-medium'>
            Sign in
          </Link>
          {showForm && (
            <p
              onClick={() => {
                setShowForm(!showForm);
              }}
              className='inline-block text-blue-500 font-medium hover:cursor-pointer'
            >
              {' '}
              Sign up with google?
            </p>
          )}
        </CardDescription>
      </CardHeader>
      {/* Renders  */}
      {!showForm ? (
        <CardContent>
          {!showForm && (
            <motion.div className='flex flex-col gap-6' key='buttons'>
              <Button
                type='button'
                className='w-full'
                onClick={() => {
                  setShowForm(true);
                }}
              >
                Sign Up with Email
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
            </motion.div>
          )}
        </CardContent>
      ) : (
        <AnimatePresence>
          <CardContent>
            <Form {...form}>
              <motion.form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6'
                key='form'
                initial='hidden'
                animate='visible'
                exit='hidden'
                variants={formVariants}
              >
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input placeholder='John Doe' {...field} />
                      </FormControl>
                      <FormMessage className='text-[0.8rem]' /> {/* Form error */}
                    </FormItem>
                  )}
                />
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
                <FormField
                  control={form.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <Input type='password' placeholder='********' {...field} />
                      </FormControl>
                      <FormMessage className='text-[0.8rem]' /> {/* Form error */}
                    </FormItem>
                  )}
                />
                <Button disabled={isSubmitting} type='submit'>
                  Submit
                </Button>
              </motion.form>
            </Form>
          </CardContent>
        </AnimatePresence>
      )}
    </Card>
  );
}
