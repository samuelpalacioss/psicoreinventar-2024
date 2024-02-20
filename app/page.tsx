import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

import { InboxIcon, TrashIcon, UsersIcon } from '@heroicons/react/24/outline';
import { CircleBackground } from '@/components/circle-background';

const features = [
  {
    name: '1. Register and Login',
    description: 'Sign up with your details and log in to access our services.',
    icon: InboxIcon,
  },
  {
    name: '2. Book Your Session',
    description:
      'Choose the type of session you need, pick your preferred psychologist, and pick a suitable session time.',
    icon: UsersIcon,
  },
  {
    name: '3. Start Your Therapy Journey',
    description:
      'Complete your payment and your appointment will be confirmed. Begin your journey towards mental well-being',
    icon: TrashIcon,
  },
];

export default function Home() {
  return (
    <>
      <main>
        <div className='bg-gradient-to-b from-indigo-100/20 pt-14'>
          <div className='mx-auto max-w-7xl px-6 py-16 sm:py-28 lg:px-8'>
            <div className=' gap-x-6 lg:mx-0 sm:flex lg:max-w-none lg:items-center'>
              <div className='w-full max-w-xl lg:shrink-0 basis-4/6 xl:max-w-2xl'>
                <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'>
                  Wellness Starts With Your <span className='text-indigo-600'>Mental Health</span>
                </h1>
                <div className='mt-6 max-w-xl'>
                  <p className='text-md leading-7 text-gray-600 max-w-md lg:max-w-full'>
                    Discover the gateway to a fulfilling life with our focused approach to mental
                    well-being. From personalized support to comprehensive strategies, we empower
                    you to prioritize your mental health for a brighter future.
                  </p>
                  <div className='mt-10 flex items-center gap-x-6'>
                    <Link
                      href='/'
                      className={cn(
                        buttonVariants({ variant: 'default' }),
                        'bg-indigo-600 text-white '
                      )}
                    >
                      Get started
                    </Link>
                    <Link
                      href='/'
                      className={cn(buttonVariants({ variant: 'outline' }), 'gap-x-1')}
                    >
                      Learn more{' '}
                      <span className='font-semibold' aria-hidden='true'>
                        &rarr;
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
              <div className='flex basis-2/6'>
                <div className='max-w-xs sm:max-w-lg pt-16 sm:ml-0 lg:pt-0 xl:order-none'>
                  <Image
                    src='https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&h=528&q=80'
                    alt='Illustration of psychologist working with a patient in a therapy session.'
                    width={528}
                    height={528}
                    className='w-full rounded-xl bg-gray-900/5 object-cover shadow-lg'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <div className='wrapper bg-gradient-to-b from-indigo-100/20 '>
        <section id='features'>
          <div className='bg-white py-24 sm:py-32'>
            <div className='mx-auto max-w-7xl px-6 lg:px-8'>
              <div className='max-w-2xl lg:mx-0'>
                <h2 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl'>
                  Easy Booking Process
                </h2>
                <p className='mt-6 text-md leading-7 text-gray-600'>
                  Quickly book your therapy session online. Choose your psychologist, session type,
                  and time, then pay securely. Prioritize your mental health effortlessly.
                </p>
              </div>
              <div className='mt-16 max-w-2xl sm:mt-20 lg:mt-24 md:max-w-none'>
                <dl className='grid grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none md:grid-cols-3'>
                  {features.map((feature) => (
                    <div key={feature.name} className='flex flex-col'>
                      <dt className='text-base font-semibold leading-7 text-gray-900'>
                        <div className='mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600'>
                          <feature.icon className='h-6 w-6 text-white' aria-hidden='true' />
                        </div>
                        {feature.name}
                      </dt>
                      <dd className='mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600'>
                        <p className='flex-auto'>{feature.description}</p>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>
        <section id='cta' className='relative overflow-hidden bg-indigo-900 py-20 sm:py-28'>
          <div className='absolute left-20 top-1/2 -translate-y-1/2 sm:left-1/2 sm:-translate-x-1/2'>
            <CircleBackground color='#fff' className='animate-spin-slower' />
          </div>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative'>
            <div className='mx-auto max-w-md sm:text-center'>
              <h2 className='text-3xl font-medium tracking-tight text-white sm:text-4xl'>
                Start Your Journey to Emotional Well-Being Today
              </h2>
              <p className='mt-4 text-md text-slate-200'>
                Ready to take a step towards a brighter tomorrow? Let's embark on this journey
                together! Click below to start your path towards healing and happiness.
              </p>
              <Link href='/' className={cn(buttonVariants({ variant: 'outline' }), 'mt-4 gap-x-1')}>
                Get started{' '}
                <span className='font-semibold' aria-hidden='true'>
                  &rarr;
                </span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
