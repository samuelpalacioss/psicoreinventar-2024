import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

export default function TherapistCardSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6 space-y-6">
        {/* Main info section with avatar */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-16">
          <div className="shrink-0 md:w-48 flex flex-col items-center">
            <Skeleton className="w-48 h-48 rounded-full" />
            <div className="mt-4 flex items-center gap-1.5">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          <div className="flex-1 space-y-5">
            <div className="text-center md:text-left">
              <Skeleton className="h-8 w-64 mb-3 mx-auto md:mx-0" />
              <Skeleton className="h-6 w-24 rounded-full mx-auto md:mx-0" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-full max-w-[780px]" />
              <Skeleton className="h-4 w-full max-w-[780px]" />
              <Skeleton className="h-4 w-3/4 max-w-[580px]" />
            </div>

            <div>
              <Skeleton className="h-5 w-24 mb-3" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-7 w-32 rounded-full" />
                <Skeleton className="h-7 w-28 rounded-full" />
                <Skeleton className="h-7 w-36 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Availability and actions section */}
        <div className="md:pl-64 space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Skeleton className="flex-1 md:flex-initial h-11 w-34 px-7 py-3" />
            <Skeleton className="flex-1 md:flex-initial h-11 w-34 px-7 py-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
