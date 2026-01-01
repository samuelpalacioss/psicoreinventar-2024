interface DashboardHeaderProps {
  title?: string;
}

export function DashboardHeader({ title = "Dashboard" }: DashboardHeaderProps) {
  return (
    <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-gray-900 p-4">{title}</h1>
  );
}
