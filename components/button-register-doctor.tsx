'use client';

import Link from 'next/link';
import { Button, buttonVariants } from './ui/button';

import { useState, useTransition } from 'react';
import { approveDoctor } from '@/actions/doctor-approved';

export default function ButtonRegisterDoctor() {
  // const doctorRegisterEmail = async () => {
  //   const doctorToken = await generateDoctorRegisterToken('samuelpl0888@gmail.com');

  //   const data = await sendDoctorRegisterEmail(
  //     'samuelpl0888@gmail.com',
  //     doctorToken.token,
  //     'Samuel'
  //   );

  //   if (!data.success) {
  //     console.log({ result: data.error });
  //     alert('Error sending doctor registration email!');
  //     return;
  //   }

  //   console.log({ result: data.passwordResetEmail });
  //   alert('Doctor registration email sent!');
  // };
  const [errorMsg, setErrorMsg] = useState<string | undefined>('');
  const [successMsg, setSuccessMsg] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();

  const doctorEmail = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    startTransition(() => {
      approveDoctor('samuelpl0888@gmail.com').then((data) => {
        setErrorMsg(data?.error);
        setSuccessMsg(data?.success);
      });
    });
  };

  return (
    // <Link href='/doctor-register' className={buttonVariants({ variant: 'default' })}>
    //   Register doctor
    // </Link>
    <Button onClick={doctorEmail}>Register doctor</Button>
  );
}
