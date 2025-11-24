// 'use client';

// import { zodResolver } from '@hookform/resolvers/zod';
// import { SubmitHandler, useForm } from 'react-hook-form';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent } from '@/components/ui/card';
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form';
// import { Textarea } from '@/components/ui/textarea';
// import { doctorSignUpSchema, doctorSignUpType } from '@/lib/validations/doctor';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { useState, useEffect, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import FormErrorMessage from './form-error-msg';
// import FormSuccessMessage from './form-success-msg';
// import MultipleSelector, { Option } from '@/components/ui/multiple-selector';
// import ProgressBar from './progress-bar';
// import { ArrowLeft, ArrowRight } from 'lucide-react';
// import { newDoctorVerification } from '@/actions/new-doctor-verification';

// interface RegisterDoctorClientFormProps {
//   specialties: Option[];
// }

// const steps = [
//   {
//     id: 1,
//     name: 'Professional Info',
//     fields: ['licenseNumber', 'specialties', 'experience', 'graduationYear', 'education'],
//   },
//   {
//     id: 2,
//     name: 'Personal Info',
//     fields: ['name', 'email', 'password', 'confirmPassword', 'phone'],
//   },
//   {
//     id: 3,
//     name: 'Profile Info',
//     fields: ['clientExpectations', 'treatmentMethods', 'strengths'],
//   },
//   {
//     id: 4,
//     name: 'About',
//     fields: ['description'],
//   },
// ];

// export default function RegisterDoctorForm({ specialties }: RegisterDoctorClientFormProps) {
//   const searchParams = useSearchParams();
//   const token = searchParams.get('token');
//   const router = useRouter();

//   const [errorMsg, setErrorMsg] = useState<string>('');
//   const [successMsg, setSuccessMsg] = useState<string>('');

//   const checkToken = useCallback(() => {
//     if (successMsg || errorMsg) return;

//     if (!token) {
//       setErrorMsg('Missing token!');
//       return;
//     }
//   }, [token, successMsg, errorMsg]);

//   useEffect(() => {
//     checkToken();
//   }, [checkToken]);

//   const form = useForm<doctorSignUpType>({
//     resolver: zodResolver(doctorSignUpSchema),
//     defaultValues: {
//       name: '',
//       email: '',
//       password: '',
//       confirmPassword: '',
//       role: 'doctor',
//       phone: '',
//       experience: '',
//       licenseNumber: '',
//       specialties: [],
//       education: '',
//       graduationYear: '',
//       clientExpectations: '',
//       treatmentMethods: '',
//       strengths: '',
//       description: '',
//     },

//     mode: 'onChange',
//   });

//   const {
//     register,
//     handleSubmit,
//     watch,
//     reset,
//     trigger,
//     formState: { errors, isSubmitting },
//     setError,
//   } = form;

//   const onSubmit: SubmitHandler<doctorSignUpType> = async (data) => {
//     // console.log(data);
//     // reset();
//     const res = await fetch('/api/register/doctor', {
//       method: 'POST',
//       body: JSON.stringify({
//         name: data.name,
//         email: data.email,
//         password: data.password,
//         confirmPassword: data.confirmPassword,
//         phone: data.phone,
//         licenseNumber: data.licenseNumber,
//         experience: data.experience,
//         graduationYear: data.graduationYear,
//         education: data.education,
//         specialties: data.specialties,
//         clientExpectations: data.clientExpectations,
//         treatmentMethods: data.treatmentMethods,
//         strengths: data.strengths,
//         description: data.description,
//       }),
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     const resData = await res.json();

//     if (!res.ok) {
//       setErrorMsg('Something went wrong');
//     } else {
//       setSuccessMsg(resData.success); // Mensaje con success en su respuesta de api/register
//       newDoctorVerification(token!)
//         .then((data) => {
//           setSuccessMsg(data.success!);
//           setErrorMsg(data.error!);
//         })
//         .catch(() => {
//           setErrorMsg('Something went wrong');
//         });
//     }
//   };

//   const [previousStep, setPreviousStep] = useState<number>(0);
//   const [currentStep, setCurrentStep] = useState<number>(0);
//   const delta = currentStep - previousStep;

//   type FieldName = keyof doctorSignUpType;

//   const next = async () => {
//     const fields = steps[currentStep].fields;
//     const output = await trigger(fields as FieldName[], { shouldFocus: true });

//     if (!output) return;

//     if (currentStep < steps.length - 1) {
//       setPreviousStep(currentStep);
//       setCurrentStep((step) => step + 1);
//     }
//   };

//   const prev = () => {
//     if (currentStep > 0) {
//       setCurrentStep((step) => step - 1);
//     }
//   };

//   // const onSubmit = async (data: doctorSignUpType) => {
//   //   const res = await fetch('/api/register/doctor', {
//   //     method: 'POST',
//   //     body: JSON.stringify({
//   //       name: data.name,
//   //       email: data.email,
//   //       password: data.password,
//   //       confirmPassword: data.confirmPassword,
//   //       phone: data.phone,
//   //       experience: data.experience,
//   //       specialties: data.specialties,
//   //       education: `${data.graduationYearraduationYear} ${data.education}`,
//   //     }),
//   //     headers: {
//   //       'Content-Type': 'application/json',
//   //     },
//   //   });

//   //   const resData = await res.json();

//   //   if (!res.ok) {
//   //     setErrorMsg('Something went wrong');
//   //   } else {
//   //     setSuccessMsg(resData.success); // Mensaje con success en su respuesta de api/register
//   //     setTimeout(() => {
//   //       router.push('/login');
//   //     }, 2000);
//   //   }

//   //   if (resData.errors) {
//   //     const errors = resData.errors;

//   //     if (errors.email) {
//   //       setError('email', {
//   //         type: 'server',
//   //         message: errors.email,
//   //       });
//   //     } else if (errors.password) {
//   //       setError('password', {
//   //         type: 'server',
//   //         message: errors.password,
//   //       });
//   //     } else if (errors.confirmPassword) {
//   //       setError('confirmPassword', {
//   //         type: 'server',
//   //         message: errors.confirmPassword,
//   //       });
//   //     } else if (errors.phone) {
//   //       setError('phone', {
//   //         type: 'server',
//   //         message: errors.phone,
//   //       });
//   //     } else if (errors.experience) {
//   //       setError('experience', {
//   //         type: 'server',
//   //         message: errors.experience,
//   //       });
//   //     } else if (errors.specialties) {
//   //       setError('specialties', {
//   //         type: 'server',
//   //         message: errors.specialties,
//   //       });
//   //     } else if (errors.education) {
//   //       setError('education', {
//   //         type: 'server',
//   //         message: errors.education,
//   //       });
//   //     } else if (errors.limit) {
//   //       setErrorMsg(errors.limit);
//   //     } else {
//   //       console.error('Registration failed');
//   //     }
//   //   }
//   // };

//   return (
//     <div className='flex flex-col space-y-4'>
//       {/* Top Progress bar*/}
//       <ProgressBar steps={steps} currentStep={currentStep} maxSteps={3} />
//       <Card className='w-lg'>
//         <CardContent className='p-6'>
//           <Form {...form}>
//             <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
//               {currentStep === 0 && (
//                 <>
//                   <FormField
//                     control={form.control}
//                     name='licenseNumber'
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>License Number</FormLabel>
//                         <FormControl>
//                           <Input type='string' placeholder='MH12345' {...field} />
//                         </FormControl>
//                         <FormMessage className='text-[0.8rem]' /> {/* Form error */}
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name='specialties'
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Specialties</FormLabel>
//                         <FormControl>
//                           <MultipleSelector
//                             {...field}
//                             defaultOptions={specialties}
//                             placeholder='Select your specialties'
//                             badgeClassName='hover:bg-primary/90'
//                             maxSelected={3}
//                             hidePlaceholderWhenSelected={true}
//                           />
//                         </FormControl>
//                         <FormMessage className='text-[0.8rem]' /> {/* Form error */}
//                       </FormItem>
//                     )}
//                   />

//                   <div className='flex gap-4'>
//                     <FormField
//                       control={form.control}
//                       name='experience'
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Years of Experience</FormLabel>
//                           <FormControl>
//                             <Input type='number' min='1' placeholder='5' {...field} />
//                           </FormControl>
//                           <FormMessage className='text-[0.8rem]' /> {/* Form error */}
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name='graduationYear'
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Graduation Year</FormLabel>
//                           <FormControl>
//                             <Input type='string' placeholder='2020' {...field} />
//                           </FormControl>
//                           <FormMessage className='text-[0.8rem]' /> {/* Form error */}
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                   <FormField
//                     control={form.control}
//                     name='education'
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Graduation Institution</FormLabel>
//                         <FormControl>
//                           <Input placeholder='Stanford University' {...field} />
//                         </FormControl>
//                         <FormMessage className='text-[0.8rem]' /> {/* Form error */}
//                       </FormItem>
//                     )}
//                   />
//                 </>
//               )}
//               {currentStep === 1 && (
//                 <>
//                   <FormField
//                     control={form.control}
//                     name='name'
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Full name</FormLabel>
//                         <FormControl>
//                           <Input placeholder='John Doe' {...field} />
//                         </FormControl>
//                         <FormMessage className='text-[0.8rem]' /> {/* Form error */}
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name='email'
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Email</FormLabel>
//                         <FormControl>
//                           <Input type='email' placeholder='jdoe@gmail.com' {...field} />
//                         </FormControl>
//                         <FormMessage className='text-[0.8rem]' /> {/* Form error */}
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name='password'
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Password</FormLabel>
//                         <FormControl>
//                           <Input type='password' placeholder='********' {...field} />
//                         </FormControl>
//                         <FormMessage className='text-[0.8rem]' /> {/* Form error */}
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name='confirmPassword'
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Confirm password</FormLabel>
//                         <FormControl>
//                           <Input type='password' placeholder='********' {...field} />
//                         </FormControl>
//                         <FormMessage className='text-[0.8rem]' /> {/* Form error */}
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name='phone'
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Phone number</FormLabel>
//                         <FormControl>
//                           <Input type='tel' placeholder='(212) 555-5555' {...field} />
//                         </FormControl>
//                         <FormMessage className='text-[0.8rem]' /> {/* Form error */}
//                       </FormItem>
//                     )}
//                   />
//                 </>
//               )}
//               {currentStep === 2 && (
//                 <>
//                   <FormField
//                     control={form.control}
//                     name='clientExpectations'
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>What can clients expect from sessions with you?</FormLabel>
//                         <FormControl>
//                           <Textarea
//                             {...field}
//                             id='about-me'
//                             placeholder='Describe what clients can expect from your sessions...'
//                             className='min-h-[100px] resize-none'
//                           />
//                         </FormControl>
//                         <FormMessage className='text-[0.8rem]' /> {/* Form error */}
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name='treatmentMethods'
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>What treatment methods do you utilize?</FormLabel>
//                         <FormControl>
//                           <Textarea
//                             {...field}
//                             id='about-me'
//                             placeholder='List and describe your treatment methods or methodologies...'
//                             className='min-h-[100px] resize-none'
//                           />
//                         </FormControl>
//                         <FormMessage className='text-[0.8rem]' /> {/* Form error */}
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name='strengths'
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>What areas do you feel are your biggest strengths?</FormLabel>
//                         <FormControl>
//                           <Textarea
//                             {...field}
//                             id='about-me'
//                             placeholder='Describe your biggest strengths...'
//                             className='min-h-[100px] resize-none'
//                           />
//                         </FormControl>
//                         <FormMessage className='text-[0.8rem]' /> {/* Form error */}
//                       </FormItem>
//                     )}
//                   />
//                 </>
//               )}
//               {currentStep === 3 && (
//                 <>
//                   <FormField
//                     control={form.control}
//                     name='description'
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>About Me</FormLabel>
//                         <FormControl>
//                           <Textarea
//                             {...field}
//                             id='about-me'
//                             placeholder='Describe yourself and your practice...'
//                             className='min-h-[200px] resize-none'
//                           />
//                         </FormControl>
//                         <FormMessage className='text-[0.8rem]' /> {/* Form error */}
//                       </FormItem>
//                     )}
//                   />
//                 </>
//               )}

//               <FormErrorMessage message={errorMsg} />
//               <FormSuccessMessage message={successMsg} />
//               <div className='flex items-center'>
//                 {currentStep > 0 && (
//                   <Button type='button' className='mr-2' onClick={prev}>
//                     <ArrowLeft className='w-4 h-4 mr-2' />
//                     Back
//                   </Button>
//                 )}
//                 {currentStep === steps.length - 1 && (
//                   <Button disabled={isSubmitting} type='submit'>
//                     Submit
//                   </Button>
//                 )}

//                 {currentStep < steps.length - 1 && (
//                   <Button type='button' onClick={next}>
//                     Next
//                     <ArrowRight className='w-4 h-4 ml-2' />
//                   </Button>
//                 )}
//               </div>
//             </form>
//           </Form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

export default function RegisterDoctorForm({ specialties }: { specialties: any[] }) {
  return <div>Register doctor form - to be implemented</div>;
}