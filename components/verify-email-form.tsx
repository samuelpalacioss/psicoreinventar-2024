'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Component() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVerifying(false);
      navigate('/dashboard');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className='flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-md text-center'>
        {isVerifying ? (
          <>
            <LoaderPinwheelIcon className='mx-auto h-12 w-12 animate-spin text-primary' />
            <h1 className='mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>
              Verifying Email...
            </h1>
          </>
        ) : error ? (
          <>
            <div className='mx-auto h-12 w-12 text-red-500' />
            <h1 className='mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>
              Something went wrong
            </h1>
            <p className='mt-4 text-muted-foreground'>
              Please try again later or contact support if the issue persists.
            </p>
          </>
        ) : (
          <>
            <div className='mx-auto h-12 w-12 text-green-500' />
            <h1 className='mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>
              Email Verified
            </h1>
            <p className='mt-4 text-muted-foreground'>
              You will be redirected to the dashboard shortly.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function LoaderPinwheelIcon() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M2 12c0-2.8 2.2-5 5-5s5 2.2 5 5 2.2 5 5 5 5-2.2 5-5' />
      <path d='M7 20.7a1 1 0 1 1 5-8.7 1 1 0 1 0 5-8.6' />
      <path d='M7 3.3a1 1 0 1 1 5 8.6 1 1 0 1 0 5 8.6' />
      <circle cx='12' cy='12' r='10' />
    </svg>
  );
}
