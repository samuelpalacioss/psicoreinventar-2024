import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <main>
        <div className='bg-gradient-to-b from-indigo-100/20 pt-14'>
          <div className='mx-auto max-w-7xl px-6 py-16 sm:py-28 lg:px-8'>
            <div className=' gap-x-6 lg:mx-0 sm:flex lg:max-w-none lg:items-center'>
              <div className='w-full max-w-xl lg:shrink-0 basis-4/6 xl:max-w-2xl'>
                <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'>
                  Wellness Starts With Your Mental Health
                </h1>
                <div className='mt-6 max-w-xl'>
                  <p className='text-md leading-8 text-gray-600 max-w-md lg:max-w-full'>
                    We seek to improve people's quality of life through the delivery of
                    comprehensive, personalized mental, emotional and behavioral health services.
                  </p>
                  <div className='mt-10 flex items-center gap-x-6'>
                    <a
                      href='#'
                      className='rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                    >
                      Get started
                    </a>
                    <a href='#' className='text-sm font-semibold leading-6 text-gray-900'>
                      Learn more <span aria-hidden='true'>→</span>
                    </a>
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
    </>
  );
}
