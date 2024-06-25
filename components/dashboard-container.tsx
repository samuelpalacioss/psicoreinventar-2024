import { cn } from '@/lib/utils';

interface DashboardContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function DashboardContainer({
  children,
  className,
  ...props
}: DashboardContainerProps) {
  return (
    <div className={cn('grid items-start gap-8 space-y-4', className)} {...props}>
      {children}
    </div>
  );
}
