import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface FormErrorMessageProps {
  message?: string;
}

export default function FormErrorMessage({ message }: FormErrorMessageProps) {
  if (!message) return null;

  return (
    <div className='flex p-2 items-center gap-2 bg-destructive/10 roundend-md text-sm text-destructive'>
      <ExclamationTriangleIcon className='h-5 w-5' />
      <span>{message}</span>
    </div>
  );
}
