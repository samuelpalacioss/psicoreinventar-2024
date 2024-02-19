'use client';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { id: 1, name: 'How it works', path: '/about' },
  { id: 2, name: 'Services', path: '/services' },
  { id: 3, name: 'Specialists', path: '/specialists' },
  { id: 4, name: 'Login', path: '/login' },
];

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (path: string) => path === pathname;
  console.log(pathname);

  return (
    <Disclosure as='nav' className='bg-white shadow'>
      {({ open }) => (
        <>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <div className='flex h-16 justify-between'>
              <div className='flex'>
                <div className='flex flex-shrink-0 items-center'>
                  <Link href={'/'} className='text-lg font-semibold text-indigo-600 pt-1 '>
                    psicoreinventar
                  </Link>
                </div>
                <div className='hidden sm:ml-6 sm:flex sm:space-x-8'>
                  {/* Current: "border-indigo-500 text-gray-900", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" */}
                  {/* <Link
                    href='/'
                    className='inline-flex items-center border-b-2 border-indigo-500 px-1 pt-1 text-sm font-medium text-gray-900'
                  >
                    Home
                  </Link>
                  <Link
                    href='/dashboard'
                    className='inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  >
                    Dashboard
                  </Link> */}
                  {navLinks.map((link) => (
                    <Link
                      key={link.id}
                      href={link.path}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                        isActive(link.path)
                          ? 'text-indigo-500'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className='-mr-2 flex items-center sm:hidden'>
                {/* Mobile menu button */}
                <Disclosure.Button className='inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500'>
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

          <Disclosure.Panel className='sm:hidden'>
            <div className='space-y-1 pb-3 pt-2'>
              {/* Current: "bg-indigo-50 border-indigo-500 text-indigo-700", Default: "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700" */}
              <ul>
                {/* <Link
                  href='/'
                  className='block border-l-4 border-indigo-500 bg-indigo-50 py-2 pl-3 pr-4 text-sm font-medium text-indigo-700'
                >
                  About us
                </Link>
                <Link
                  href='/'
                  className='block border-l-4 border-transparent py-2 pl-3 pr-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                >
                  Dashboard
                </Link> */}

                {navLinks.map((link) => (
                  <Link
                    key={link.id}
                    href={link.path}
                    className={`block border-l-4 ${
                      isActive(link.path)
                        ? 'border-indigo-500 bg-indigo-50 py-2 pl-3 pr-4 text-sm font-medium text-indigo-700'
                        : 'border-transparent py-2 pl-3 pr-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </ul>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
