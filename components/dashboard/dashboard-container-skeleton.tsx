import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton that matches DashboardContainer layout so loading fallback
 * looks identical (header + content area) but with pulse placeholders.
 */
export function DashboardContainerSkeleton() {
  return (
    <div className="@container/main flex flex-1 flex-col">
      <div className="flex flex-col gap-6 py-8 md:py-12">
        {/* Header block: title + description placeholders */}
        <div className="px-6 lg:px-12 max-w-3xl space-y-3">
          <Skeleton className="h-9 w-64 sm:h-10 sm:w-80 rounded-md" />
          <Skeleton className="h-5 w-full max-w-2xl rounded-md" />

        </div>

        {/* Content area: same padding as DashboardContainer, skeleton lines */}
        <div className="px-6 lg:px-12 space-y-4">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}
