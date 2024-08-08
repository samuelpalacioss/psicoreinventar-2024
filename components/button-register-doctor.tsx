'use client';

import Link from 'next/link';
import { Button, buttonVariants } from './ui/button';

export default function ButtonRegisterDoctor() {
  return (
    <Link href='/doctor-register' className={buttonVariants({ variant: 'default' })}>
      Register doctor
    </Link>
  );
}
