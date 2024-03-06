import { cn } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Container({ children, className, ...props }: ContainerProps) {
  return (
    <div className={cn('max-w-7xl px-4 sm:px-6 lg:px-8', className)} {...props}>
      {children}
    </div>
  );
}
