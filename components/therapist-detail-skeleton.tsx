import { Skeleton } from "./ui/skeleton";
import { Separator } from "./ui/separator";
import { Card, CardContent } from "./ui/card";
import Container from "./container";

export default function TherapistDetailSkeleton() {
  return (
    <div>
      {/* Top info bar - Specializes in */}
      <section className="py-4 sm:py-6">
        <Container>
          <div className="mb-0 sm:mb-6 pb-4 border-b flex flex-wrap gap-4 text-sm text-gray-700">
            <div className="flex items-center flex-wrap gap-1 text-xs sm:text-sm">
              <span className="text-gray-600">Specializes in</span>{" "}
              <Skeleton className="h-7 w-24 mx-1" />
              <Skeleton className="h-7 w-28 mx-1" />
              <Skeleton className="h-7 w-32 mx-1" />
              <Skeleton className="h-4 w-16 ml-1" />
            </div>
          </div>
        </Container>
      </section>

      {/* Hero Section */}
      <section id="hero">
        <Container>
          <div className="space-y-8 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative">
              {/* Book Session CTA - Top Right */}
              <div className="absolute top-0 right-0 hidden lg:block">
                <Skeleton className="h-10 w-32" />
              </div>

              <div className="shrink-0 relative flex flex-col items-center sm:items-start">
                {/* Avatar */}
                <Skeleton className="w-36 h-36 sm:w-40 sm:h-40 rounded-full" />
                {/* Rating */}
                <div className="mt-3 flex items-center gap-1.5">
                  <Skeleton className="w-4 h-4" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="text-center sm:text-left">
                  {/* Name */}
                  <Skeleton className="h-9 w-48 mb-2 mx-auto sm:mx-0" />
                  {/* Credentials */}
                  <Skeleton className="h-6 w-64 mb-3 mx-auto sm:mx-0" />
                  {/* Session Price */}
                  <Skeleton className="h-7 w-32 mb-3 mx-auto sm:mx-0" />
                  {/* Personality Traits */}
                  <div className="flex flex-wrap gap-2 mb-3 justify-center sm:justify-start">
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-7 w-20" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 text-sm text-gray-700 items-center sm:items-start">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Location/Virtual */}
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    {/* Next Available */}
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overview Tab */}
            <div className="relative">
              <div className="inline-block py-3 pr-3 text-gray-900 font-medium relative z-10 border-b-3 border-indigo-600">
                Overview
              </div>
              <div className="-mx-6 lg:mx-0 absolute bottom-0 left-0 right-0">
                <Separator />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Content Grid with Sidebar */}
      <section className="pb-28 lg:pb-0">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Me */}
              <section>
                <Skeleton className="h-8 w-32 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </section>

              {/* Get to Know Me */}
              <section>
                <Skeleton className="h-8 w-48 mb-4" />

                <div className="space-y-6">
                  <div>
                    <Skeleton className="h-5 w-80 mb-2" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </div>

                  <div>
                    <Skeleton className="h-5 w-96 mb-2" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
