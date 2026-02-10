import { notFound } from "next/navigation";
import { findDoctorDetailById, findDoctorReviews } from "@/src/dal/doctors";
import TherapistDetail, { type TherapistDetailProps } from "@/components/therapist-detail";
import { type ReviewCardProps } from "@/components/review-card";
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { STALE_TIMES } from "@/lib/queries/stale-times";
import TherapistDetailSkeleton from "@/components/therapist-detail-skeleton";

interface PageProps {
  params: Promise<{ doctorId: string }>;
}

export default function TherapistDetailPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<TherapistDetailSkeleton />}>
        <TherapistDetailContent params={params} />
      </Suspense>
    </div>
  );
}

async function TherapistDetailContent({ params }: PageProps) {
  "use cache";

  const { doctorId } = await params;
  const id = parseInt(doctorId, 10);
  if (!id || id < 1) notFound();

  cacheLife({
    stale: STALE_TIMES.DOCTORS / 1000, // Convert from ms to seconds (30 min)
    revalidate: 3600, // 1 hour - check for updates every hour in background
    expire: 86400, // 1 day - purge after 1 day
  });

  cacheTag(`doctor-${id}`);

  const doctor = await findDoctorDetailById(id);

  if (!doctor) {
    notFound();
  }

  // Fetch reviews with pagination
  const { data: reviewsData } = await findDoctorReviews(id, { page: 1, limit: 10, offset: 0 });

  // Calculate years in practice
  const currentYear = new Date().getFullYear();
  const yearsInPractice = currentYear - doctor.practiceStartYear;

  // Get full name
  const fullName = [
    doctor.firstName,
    doctor.middleName,
    doctor.firstLastName,
    doctor.secondLastName,
  ]
    .filter(Boolean)
    .join(" ");

  // Get credentials from educations (highest/latest degree)
  const credentials =
    doctor.educations && doctor.educations.length > 0
      ? doctor.educations[doctor.educations.length - 1].degree
      : "Licensed Therapist";

  // Get profile image from user
  const profileImage = doctor.user?.image;


  // Get specialties from conditions (primary type)
  const allSpecialties =
    doctor.doctorConditions
      ?.filter((dc) => dc.condition && dc.type === "primary")
      .map((dc) => dc.condition!.name) || [];

  const topSpecialties = allSpecialties.slice(0, 3);

  // Get other specialties (type "other")
  const otherSpecialties =
    doctor.doctorConditions
      ?.filter((dc) => dc.condition && dc.type === "other")
      .map((dc) => dc.condition!.name) || [];

  // Get age groups with age ranges
  const agesServed = doctor.ageGroups?.map((ag) => `${ag.name} (${ag.minAge}-${ag.maxAge})`) || [];

  // Get licensed states from education institutions (unique places)
  const licensedStates = Array.from(
    new Set(
      doctor.educations
        ?.map((edu) => edu.institution?.place?.displayPlace)
        .filter(Boolean) as string[]
    )
  );

  // Get session price from services (first service price)
  const sessionPrice =
    doctor.doctorServices && doctor.doctorServices.length > 0
      ? doctor.doctorServices[0].amount
      : undefined;

  // Get identities
  const identitiesArray =
    doctor.doctorIdentities?.map((di) => di.identity.name) || [];

  // Get personality traits
  const personalityTraitsArray =
    doctor.doctorPersonalityTraits?.map((dpt) => dpt.personalityTrait.name) || [];

  // Calculate average rating and total ratings
  const totalRatings = reviewsData.length;
  const averageRating =
    totalRatings > 0
      ? reviewsData.reduce((sum, review) => sum + review.score, 0) / totalRatings
      : 0;

  // Transform reviews to ReviewCardProps
  const reviews: ReviewCardProps[] = reviewsData.map((review) => {
    const personName = review.person
      ? [review.person.firstName, review.person.firstLastName]
        .filter(Boolean)
        .join(" ")
      : "Anonymous";

    return {
      clientInfo: `Verified client - ${personName}`,
      sessionNumber: review.afterSessions,
      therapistName: fullName,
      rating: review.score,
      date: new Date(review.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      content: review.description || "",
    };
  });

  // Transform schedules to available slots (simplified - would need more logic for actual availability)
  const availableSlots = doctor.schedules
    ? doctor.schedules.slice(0, 3).map((schedule) => ({
      date: schedule.day,
      times: [schedule.startTime],
    }))
    : [];

  // Get next available (simplified - use first schedule day)
  const nextAvailable =
    doctor.schedules && doctor.schedules.length > 0
      ? doctor.schedules[0].day
      : undefined;


  // TODO: Get accepted insurances (would need a new table/field)
  const accepts = ["Cash"];

  const therapistDetailProps: TherapistDetailProps = {
    id: doctor.id,
    name: fullName,
    credentials,
    image: profileImage || undefined,
    description: doctor.biography,
    specialties: topSpecialties,
    yearsInPractice,
    averageRating,
    totalRatings,
    place: doctor.place,
    consultationType: doctor.consultationType,
    aboutMe: doctor.biography,
    sessionPrice,
    getToKnowMe: {
      firstSession: doctor.firstSessionExpectation,
      strengths: doctor.biggestStrengths,
    },
    otherSpecialties,
    identities: identitiesArray,
    agesServed,
    licensedIn: licensedStates,
    accepts,
    availableSlots,
    nextAvailable,
    personalityTraits: personalityTraitsArray,
    reviews,
  };

  return (
    <TherapistDetail {...therapistDetailProps} />
  );
}
