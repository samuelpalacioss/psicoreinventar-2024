import Link from 'next/link';

const services = [
  {
    id: '1',
    name: 'Individual therapy',
    price: 49.99,
    time: '1h',
    description: 'Online therapy for one person',
  },
  {
    id: '2',
    name: 'Couples therapy',
    price: 79.99,
    time: '1h',
    description: 'Online therapy for couples',
  },
];

export default function ServicesPage() {
  return (
    <section className='py-16 sm:py-32'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <h3 className='text-lg font-semibold leading-8 tracking-tight text-indigo-600'>
          This is the best time to start taking care of yourself
        </h3>
        <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'>
          Book now your therapy session
        </h1>
        <div className='grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 md:gap-y-10 md:max-w-5xl lg:grid-cols-2'>
          {services.map((service) => (
            <div
              key={service.id}
              className='flex flex-col justify-between rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-900/10 sm:p-10'
            >
              <div>
                <h3 id={service.id} className='text-base font-semibold leading-7 text-indigo-600'>
                  {service.name}
                </h3>
                <div className='mt-4 flex items-baseline gap-x-2'>
                  <span className='text-5xl font-bold tracking-tight text-gray-900'>
                    ${service.price}
                  </span>
                  <span className='text-base font-semibold leading-7 text-gray-600'>
                    / {service.time}
                  </span>
                </div>
                <p className='mt-6 text-base leading-7 text-gray-600'>{service.description}</p>
              </div>
              <Link
                href={'/login'}
                aria-describedby={service.name}
                className='mt-8 block rounded-md bg-indigo-600 px-3.5 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
