type Step = {
  id: number;
  name: string;
  fields: string[];
};

interface ProgressBarProps {
  currentStep: number;
  steps: Step[];
  maxSteps: number; // If there are more steps than this, the maxStep section will show the extra steps but under the same step name, meaning if there are 10 steps and maxSteps is 5, the last 5 steps will be shown as step 5
}

export default function ProgressBar({ currentStep, steps, maxSteps }: ProgressBarProps) {
  const displayedSteps =
    steps.length > maxSteps
      ? [
          ...steps.slice(0, maxSteps - 1),
          {
            id: maxSteps,
            // name: `${steps[maxSteps - 1].name} + ${steps.length - maxSteps + 1} more`,
            name: `${steps[maxSteps - 1].name}`,
            fields: [],
          },
        ]
      : steps;

  return (
    <nav aria-label='Progress'>
      <ol role='list' className='space-y-4 md:flex md:space-x-8 md:space-y-0'>
        {displayedSteps.map((step, index) => {
          const isCurrent = currentStep === index;
          const isCompleted = currentStep > index;

          return (
            <li key={step.name} className='md:flex-1'>
              {isCompleted ? (
                <button className='group flex w-full flex-col border-l-4 border-indigo-600 lg:py-2 pl-4 hover:border-indigo-800 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'>
                  <span className='text-sm font-medium text-indigo-600 group-hover:text-indigo-800'>
                    {step.id}
                  </span>
                  <span className='text-sm font-medium'>{step.name}</span>
                </button>
              ) : isCurrent ? (
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
          );
        })}
      </ol>
    </nav>
  );
}
