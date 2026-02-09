import { findAllDoctors } from "@/src/dal";
import SearchTherapistsBar from "@/components/search-therapists-bar";
import TherapistCard from "@/components/therapist-card";

type Doctor = Awaited<ReturnType<typeof findAllDoctors>>["data"][number];

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
  const place = doctor.place;

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
      place={place}
    />
  );
}

export default async function Specialists() {
  const result = await findAllDoctors(
    { isActive: true },
    { page: 1, limit: 20, offset: 0 },
    undefined,
    {
      columns: {
        id: true,
        firstName: true,
        middleName: true,
        firstLastName: true,
        secondLastName: true,
        practiceStartYear: true,
        biography: true,
      },
      includePlace: true,
      includeStats: true,
      includeConditions: true,
    }
  );

  return (
    <>
      <SearchTherapistsBar />
      <main className="mx-auto max-w-7xl px-6 lg:px-8 space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-24">
        <div className="space-y-6">
          {result.data.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>

        {result.data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No therapists found</p>
          </div>
        )}

        {result.pagination.totalCount > 0 && (
          <div className="text-center text-sm text-gray-600 mt-8">
            Showing {result.data.length} of {result.pagination.totalCount} therapists
          </div>
        )}
      </main>
    </>
  );
}
