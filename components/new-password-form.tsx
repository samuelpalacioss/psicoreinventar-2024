// 'use client';

// import { zodResolver } from '@hookform/resolvers/zod';
// import { Button, buttonVariants } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form';
// import { useForm } from 'react-hook-form';
// // import { newPasswordSchema, newPasswordType } from '@/lib/validations/auth';
// import Link from 'next/link';
// import { Icons } from '@/components/icons';
// import { useState, useTransition } from 'react';
// import { useSearchParams } from 'next/navigation';
// // import { newPassword } from '@/actions/new-password';
// import FormsuccessMsg from './form-success-msg';
// import FormErrorMessage from './form-error-msg';
// import { cn } from '@/lib/utils';

// export default function NewPasswordForm() {
//   const searchParams = useSearchParams();
//   const token = searchParams.get('token');
//   const [isPending, startTransition] = useTransition();

//   // const form = useForm<newPasswordType>({
//   //   resolver: zodResolver(newPasswordSchema),
//   //   defaultValues: {
//   //     password: '',
//   //     confirmPassword: '',
//   //   },
//   // });

//   // const {
//   //   formState: { errors },
//   //   setError,
//   // } = form;

//   const [errorMsg, setErrorMsg] = useState<string | undefined>('');
//   const [successMsg, setSuccessMsg] = useState<string | undefined>('');

//   const onSubmit = async (data: any) => {
//     setErrorMsg('');
//     setSuccessMsg('');

//     // startTransition(() => {
//     //   newPassword(data, token).then((data) => {
//     //     setErrorMsg(data?.error);
//     //     setSuccessMsg(data?.success);
//     //   });
//     // });
//   };

//   return (
//     <Card className='w-[24rem]'>
//       <CardHeader>
//         <CardTitle>Reset password</CardTitle>
//         <CardDescription>Enter a new password for your account</CardDescription>
//       </CardHeader>
//       <CardContent>
//         {/* <Form {...form}> */}
//           <form onSubmit={(e) => { e.preventDefault(); onSubmit({}); }} className='space-y-4'>
//             {/* <FormField
//               control={form.control}
//               name='password'
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>New Password</FormLabel>
//                   <FormControl>
//                     <Input type='password' placeholder='********' disabled={isPending} {...field} />
//                   </FormControl>
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name='confirmPassword'
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Confirm password</FormLabel>
//                   <FormControl>
//                     <Input type='password' placeholder='********' disabled={isPending} {...field} />
//                   </FormControl>
//                   <FormMessage className='text-[0.8rem]' />
//                 </FormItem>
//               )}
//             /> */}

//             <FormErrorMessage message={errorMsg} />
//             <FormsuccessMsg message={successMsg} />
//             <div className='flex flex-col gap-6'>
//               <Button disabled={isPending} type='submit' className='w-full'>
//                 Reset password
//               </Button>
//               <Link href='/login' className={cn(buttonVariants({ variant: 'link' }))}>
//                 <Icons.chevronLeft className='mr-2 h-4 w-4' />
//                 Back to login
//               </Link>
//             </div>
//           </form>
//         {/* </Form> */}
//       </CardContent>
//     </Card>
//   );
// }
