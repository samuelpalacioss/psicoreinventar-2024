import SearchTherapistsBar from "@/components/search-therapists-bar";
import TherapistCard from "@/components/therapist-card";

const mockTherapists = [
  {
    id: 1,
    name: "Nichole Langley",
    credentials: "LMHC",
    image: "/placeholder-therapist-1.jpg",
    category: "Therapy",
    description: "I like to take a collaborative approach to my sessions. I generally will ask a lot of questions, challenging you to think differently. My belief is that you know yourselves best and it is my role to unlock the skills you already have. When working with me, you can expect to take away new concepts to ponder until the next session. I encourage you to come to session with anything that is on your mind. Together, we can break down situations and find patterns that can be changed or strengthened. Often, our time together is limited, and the true change comes as a result of the work done in between sessions.",
    specialties: ["Anxiety", "Depression", "ADHD", "Life transitions", "Life coaching", "Stress", "Peer relationship", "Relationships"],
    yearsInPractice: 3,
    acceptingClients: true,
    averageRating: 4.8,
    totalRatings: 12,
    isVirtual: true,
  },
  {
    id: 2,
    name: "Sarah Mitchell",
    credentials: "PhD",
    image: "/placeholder-therapist-2.jpg",
    category: "Psychology",
    description: "My therapeutic approach integrates evidence-based practices with a focus on building resilience and personal growth. I believe in creating a safe, non-judgmental space where clients can explore their thoughts and feelings. Through our work together, you'll develop practical coping strategies and gain deeper insights into patterns that may be holding you back from living your best life.",
    specialties: ["Trauma", "PTSD", "Anxiety", "Family conflict", "Grief", "Self esteem"],
    yearsInPractice: 8,
    acceptingClients: true,
    averageRating: 5.0,
    totalRatings: 3,
    isVirtual: true,
  },
  {
    id: 3,
    name: "Michael Chen",
    credentials: "LCSW",
    image: "/placeholder-therapist-3.jpg",
    category: "Therapy",
    description: "I work with individuals and couples navigating life transitions, relationship challenges, and personal growth. My approach is warm, direct, and solution-focused. I believe therapy should be a collaborative process where we work together to identify your goals and develop concrete strategies to achieve them. Whether you're dealing with stress, relationship issues, or simply feeling stuck, I'm here to help you move forward.",
    specialties: ["Couples therapy", "Relationship issues", "Career counseling", "Stress management", "Communication skills", "Work-life balance"],
    yearsInPractice: 5,
    acceptingClients: false,
    averageRating: 4.5,
    totalRatings: 8,
    isVirtual: false,
  },
];

export default function Specialists() {
  return (
    <>
      <SearchTherapistsBar />
      <main className='mx-auto max-w-7xl px-6 lg:px-8 space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32'>
        <h1 className='font-semibold text-3xl md:text-7xl mb-8'>Specialists</h1>

        <div className='space-y-6'>
          {mockTherapists.map((therapist) => (
            <TherapistCard
              key={therapist.id}
              id={therapist.id}
              name={therapist.name}
              credentials={therapist.credentials}
              image={therapist.image}
              category={therapist.category}
              description={therapist.description}
              specialties={therapist.specialties}
              yearsInPractice={therapist.yearsInPractice}
              averageRating={therapist.averageRating}
              totalRatings={therapist.totalRatings}
              isVirtual={therapist.isVirtual}
            />
          ))}
        </div>
      </main>
    </>
  );
}
