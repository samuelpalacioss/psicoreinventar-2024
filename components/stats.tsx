import { StatItem } from '@/types';

interface StatsProps extends React.HTMLAttributes<HTMLDivElement> {
  stats: StatItem[];
}

export default function Stats({ stats }: StatsProps) {
  return (
    <div className='mx-auto max-w-7xl'>
      <div className='mx-auto md:p-5 lg:p-0 lg:max-w-none'>
        <dl className='grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center md:grid-cols-4'>
          {stats.length > 0 &&
            stats.map((stat, i) => (
              <div key={i} className='flex flex-col lg:p-8 gap-4'>
                <dt className='text-md leading-6 text-gray-600'>{stat.description}</dt>
                <dd className='order-first text-3xl font-semibold tracking-tight text-gray-900'>
                  {stat.value}
                </dd>
              </div>
            ))}
        </dl>
      </div>
    </div>
  );
}
