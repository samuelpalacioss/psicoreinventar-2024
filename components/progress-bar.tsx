import { Dispatch, SetStateAction } from 'react';

type Step = {
  id: number;
  name: string;
  fields: string[];
};

interface ProgressBarProps {
  currentStep: number;
  steps: Step[];
}

export default function ProgressBar({ currentStep, steps }: ProgressBarProps) {
  return (
    <nav aria-label='Progress'>
      <ol role='list' className='space-y-4 md:flex md:space-x-8 md:space-y-0'>
        {steps.map((step, index) => (
          <li key={step.name} className='md:flex-1'>
            {currentStep > index ? (
              <button className='group flex w-full flex-col border-l-4 border-indigo-600 lg:py-2 pl-4 hover:border-indigo-800 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'>
                <span className='text-sm font-medium text-indigo-600 group-hover:text-indigo-800'>
                  {step.id}
                </span>
                <span className='text-sm font-medium'>{step.name}</span>
              </button>
            ) : currentStep === index ? (
              <button
                className='flex w-full flex-col border-l-4 border-indigo-600 lg:py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'
                aria-current='step'
              >
                <span className='text-sm font-medium text-indigo-600'>{step.id}</span>
                <span className='text-sm font-medium'>{step.name}</span>
              </button>
            ) : (
              <button className='group flex w-full flex-col border-l-4 border-gray-200 lg:py-2 pl-4 hover:border-gray-300 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'>
                <span className='text-sm font-medium text-gray-500 group-hover:text-gray-700'>
                  {step.id}
                </span>
                <span className='text-sm font-medium'>{step.name}</span>
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
