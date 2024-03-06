import { cn } from '@/lib/utils';
import Container from './container';

interface DashboardContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function DashboardContainer({
  children,
  className,
  ...props
}: DashboardContainerProps) {
  return (
    <div className={cn('grid items-start gap-8')} {...props}>
      <Container className={cn(className)}>{children}</Container>
    </div>
  );
}
