"use client";

interface DashboardContainerProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function DashboardContainer({ title, description, children }: DashboardContainerProps) {
  return (
    <div className="@container/main flex flex-1 flex-col">
      <div className="flex flex-col gap-6 py-8 md:py-12">
        {(title || description) && (
          <div className="px-6 lg:px-12 max-w-3xl">
            {title && (
              <h1 className="text-3xl sm:text-4xl font-medium text-gray-900 mb-3 leading-tight">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-base sm:text-lg text-gray-600 font-light leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Content area */}
        <div className="px-6 lg:px-12">{children}</div>
      </div>
    </div>
  );
}
