import SearchTherapistsBar from "@/components/search-therapists-bar";
import TherapistCardSkeleton from "@/components/therapist-card-skeleton";

export default function Loading() {
  return (
    <>
      <SearchTherapistsBar />
      <main className="mx-auto max-w-7xl px-6 lg:px-8 space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-24">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <TherapistCardSkeleton key={index} />
          ))}
        </div>
      </main>
    </>
  );
}
