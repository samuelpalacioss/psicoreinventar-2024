"use client";

import { useDoctors, type Doctor } from "@/lib/hooks";
import SearchTherapistsBar from "@/components/search-therapists-bar";
import TherapistCard from "@/components/therapist-card";

function DoctorCard({ doctor }: { doctor: Doctor }) {
  const fullName = [
    doctor.firstName,
    doctor.middleName,
    doctor.firstLastName,
    doctor.secondLastName,
  ]
    .filter(Boolean)
    .join(" ");

  const yearsInPractice = new Date().getFullYear() - doctor.practiceStartYear;

  const averageRating = Number(doctor.stats?.averageScore) || 0;
  const totalRatings = Number(doctor.stats?.totalReviews) || 0;
  const specialties = doctor.conditions || [];

  return (
    <TherapistCard
      id={doctor.id}
      name={fullName}
      credentials=""
      image=""
      category="Therapy"
      description={doctor.biography || "No biography available"}
      specialties={specialties}
      yearsInPractice={yearsInPractice}
      averageRating={averageRating}
      totalRatings={totalRatings}
      isVirtual={true}
    />
  );
}

export default function Specialists() {
  const { data, isLoading, error } = useDoctors(
    { isActive: true },
    { page: 1, limit: 20, offset: 0 },
    { lite: true }
  );

  return (
    <>
      <SearchTherapistsBar />
      <main className="mx-auto max-w-7xl px-6 lg:px-8 space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <h1 className="font-light text-3xl md:text-7xl mb-8">Therapists</h1>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading therapists...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">Error loading therapists: {error.message}</p>
          </div>
        )}

        {data && (
          <>
            <div className="space-y-6">
              {data.data.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>

            {data.data.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No therapists found</p>
              </div>
            )}

            {data.pagination.total > 0 && (
              <div className="text-center text-sm text-gray-600 mt-8">
                Showing {data.data.length} of {data.pagination.total} therapists
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
