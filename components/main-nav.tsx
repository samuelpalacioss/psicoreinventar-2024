'use client';
import { cn } from '@/lib/utils';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { buttonVariants } from './ui/button';
import { MainNavItem } from '@/types';
import { User } from 'next-auth';

interface NavbarProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: MainNavItem[];
  children?: React.ReactNode;
  shadow?: boolean; //  shadow on marketing  but not on dashboard
  user?: Pick<User, 'name' | 'image'>;
}

export default function Navbar({ className, items, children, shadow }: NavbarProps) {
  const pathname = usePathname();
  const isActive = (path: string) => path === pathname;

  return (
    <Disclosure as='nav' className={cn(shadow ? 'shadow' : '')}>
      {({ open }) => (
        <>
          <div className={cn('mx-auto max-w-7xl px-4 md:px-6 lg:px-8', className)}>
            <div className='flex h-16 items-center justify-between'>
              <div className='flex'>
                <div className='flex flex-shrink-0'>
                  {/* If mobile nav open, close it, otherwise simple link */}
                  {open ? (
                    <Disclosure.Button
                      as={Link}
                      href={'/'}
                      className='text-lg font-semibold text-indigo-600 pt-1 '
                    >
                      psicoreinventar
                    </Disclosure.Button>
                  ) : (
                    <Link href={'/'} className='text-lg font-semibold text-indigo-600 pt-1 '>
                      psicoreinventar
                    </Link>
                  )}
                </div>
                <div className='hidden md:ml-6 md:flex md:gap-6'>
                  {items?.length &&
                    items.map((link, index) => (
                      <Link
                        key={index}
                        href={link.href}
                        className={cn(
                          'inline-flex items-center px-1 pt-1 text-sm font-medium ',
                          isActive(link.href)
                            ? 'text-gray-800'
                            : 'text-gray-500 transition-colors hover:text-gray-700'
                        )}
                      >
                        {link.title}
                      </Link>
                    ))}
                </div>
              </div>
              <Link
                href='/login'
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  'hidden md:inline-flex bg-indigo-600'
                )}
              >
                Login
              </Link>

              {/* Mobile menu button*/}
              <div className='-mr-2 flex items-center md:hidden'>
                <Disclosure.Button className='inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500'>
                  <span className='sr-only'>Open main menu</span>
                  {open ? (
                    <XMarkIcon className='block h-6 w-6' aria-hidden='true' />
                  ) : (
                    <Bars3Icon className='block h-6 w-6' aria-hidden='true' />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>
          {/* Mobile menu */}
          <AnimatePresence>
            {open && (
              <Disclosure.Panel
                as={motion.div}
                className='md:hidden overflow-hidden'
                static
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className='space-y-1 pb-3 pt-2'>
                  <ul>
                    {items?.length &&
                      items.map((link, index) => (
                        <Disclosure.Button
                          as={Link}
                          key={index}
                          href={link.href}
                          className={`block border-l-4 ${
                            isActive(link.href)
                              ? 'border-indigo-500 bg-indigo-50 py-2 pl-3 pr-4 text-sm font-medium text-indigo-700'
                              : 'border-transparent py-2 pl-3 pr-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                          }`}
                        >
                          {link.title}
                        </Disclosure.Button>
                      ))}
                    <Disclosure.Button
                      as={Link}
                      href='/login'
                      className={cn(
                        buttonVariants({ variant: 'default' }),
                        'md:inline-flex ml-3 mr-4 my-2 bg-indigo-600'
                      )}
                    >
                      Login
                    </Disclosure.Button>
                  </ul>
                </div>
              </Disclosure.Panel>
            )}
          </AnimatePresence>
        </>
      )}
    </Disclosure>
  );
}
