import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { VscStarFull } from 'react-icons/vsc';
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

const testimonials = [
  {
    author: {
      name: 'John Doe',
      imageUrl: `https://ui-avatars.com/api/?name=John+Doe&background=4f46e5&color=fff`,
    },
    rating: 4,
    body: 'I felt heard and understood. The psychologist was very professional and the session was very helpful.',
  },
  {
    author: {
      name: 'Jane Smith',
      imageUrl: `https://ui-avatars.com/api/?name=Jane+Smith&background=4f46e5&color=fff`,
    },
    rating: 5,
    body: 'I was skeptical about online therapy at first, but this service has changed my mind. Highly recommended!',
  },
  {
    author: {
      name: 'Robert Johnson',
      imageUrl: `https://ui-avatars.com/api/?name=Robert+Johnson&background=4f46e5&color=fff`,
    },
    rating: 5,
    body: 'The psychologist was very understanding and helpful. The online platform was easy to use.',
  },
  {
    author: {
      name: 'Emily Davis',
      imageUrl: `https://ui-avatars.com/api/?name=Emily+Davis&background=4f46e5&color=fff`,
    },
    rating: 4,
    body: 'The service was great, and the psychologist was very professional. I felt comfortable discussing my issues.',
  },
  {
    author: {
      name: 'Michael Miller',
      imageUrl: `https://ui-avatars.com/api/?name=Michael+Miller&background=4f46e5&color=fff`,
    },
    rating: 5,
    body: 'The online psychology appointment service was very efficient. I was able to schedule an appointment easily and the session was very helpful.',
  },
  {
    author: {
      name: 'Sarah Brown',
      imageUrl: `https://ui-avatars.com/api/?name=Sarah+Brown&background=4f46e5&color=fff`,
    },
    rating: 4,
    body: 'I found the service to be very beneficial. The psychologist was knowledgeable and empathetic.',
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
        <section id='features' className='py-24 sm:py-32'>
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
        </section>
        <section id='testimonials' className='mt-32 sm:mt-40'>
          <div className='mx-auto max-w-7xl px-6 lg:px-8'>
            <h3 className='text-2xl font-semibold leading-8 tracking-tight text-indigo-600'>
              Testimonials
            </h3>
            <p className='mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6'>
              We have worked with thousands of amazing people
            </p>
            <div className='md:grid grid-cols-3 max-w-5xl gap-y-8 gap-x-14'>
              {testimonials.map((testimonial, i) => (
                <div className='flex flex-col rounded-2xl text-sm leading-6' key={i}>
                  <Image
                    alt='Avatar of the testimonial author'
                    src={testimonial.author.imageUrl}
                    className='inline-flex items-center justify-center rounded-full bg-gray-500'
                    height={48}
                    width={48}
                  />
                  <h4 className='font-semibold text-gray-900 mt-1'>{testimonial.author.name}</h4>
                  <div className='flex items-center gap-x-1 mt-1'>
                    {/* Stars rating display */}
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <VscStarFull key={i} className='h-4 w-4 text-indigo-600' />
                    ))}
                  </div>
                  <p className='text-gray-600 max-w-md'>{testimonial.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id='cta' className='mt-32 sm:mt-40'>
          <div className='relative isolate overflow-hidden bg-gray-900 py-24 text-center shadow-2xl px-4 sm:px-6 lg:px-8'>
            <div className='absolute left-20 top-1/2 -translate-y-1/2 sm:left-1/2 sm:-translate-x-1/2'>
              <CircleBackground color='#fff' className='animate-spin-slower' />
            </div>
            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative'>
              <div className='mx-auto max-w-md sm:text-center'>
                <h2 className='text-3xl font-medium tracking-tight text-white sm:text-4xl'>
                  Start Your Journey to Emotional Well-Being Today
                </h2>
                <p className='mt-4 text-md text-slate-200'>
                  Ready to take a step towards a brighter tomorrow? Let&apos;s embark on this
                  journey together! Click below to start your path towards healing and happiness.
                </p>
                <Link
                  href='/'
                  className={cn(buttonVariants({ variant: 'outline' }), 'mt-4 gap-x-1')}
                >
                  Get started{' '}
                  <span className='font-semibold' aria-hidden='true'>
                    &rarr;
                  </span>
                </Link>
              </div>
            </div>

            <div
              className='absolute -top-24 right-0 -z-10 transform-gpu blur-3xl'
              aria-hidden='true'
            >
              <div
                className='aspect-[1404/767] w-[87.75rem] bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-25'
                style={{
                  clipPath:
                    'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
                }}
              />
            </div>
          </div>
        </section>

        {/* <section id='cta' className='relative overflow-hidden bg-indigo-900 py-20 sm:py-28'>
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
        </section> */}
      </div>
    </>
  );
}
