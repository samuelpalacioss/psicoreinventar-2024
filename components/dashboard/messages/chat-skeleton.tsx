import { Skeleton } from "@/components/ui/skeleton";

export function ChatSkeleton() {
  return (
    <div className="h-full p-6 lg:p-12">
      <div className="grid h-full min-h-[620px] grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="h-full rounded-2xl bg-gray-50/50 p-4">
          <div className="space-y-4">
            <Skeleton className="h-7 w-36 rounded-md" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3 rounded-xl p-2">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div className="w-full space-y-2">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-full max-w-[180px] rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="hidden h-full flex-col rounded-2xl bg-gray-50/50 p-4 sm:p-6 lg:flex">
          <div className="flex items-center gap-3 border-b border-gray-200/70 pb-4">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-36 rounded-md" />
              <Skeleton className="h-3 w-28 rounded-md" />
            </div>
          </div>

          <div className="flex-1 space-y-5 py-6">
            <div className="max-w-[72%] space-y-2">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
            <div className="ml-auto max-w-[72%] space-y-2">
              <Skeleton className="h-14 w-full rounded-2xl" />
              <Skeleton className="ml-auto h-3 w-20 rounded-md" />
            </div>
            <div className="max-w-[72%] space-y-2">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
          </div>

          <div className="border-t border-gray-200/70 pt-4">
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </section>
      </div>
    </div>
  );
}
