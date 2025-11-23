import { cn } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Container({ children, className, ...props }: ContainerProps) {
  return (
    <div className={cn('max-w-7xl mx-auto px-6 lg:px-8', className)} {...props}>
      {children}
    </div>
  );
}
