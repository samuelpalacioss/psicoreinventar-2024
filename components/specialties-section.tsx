import Container from "@/components/container";
import Link from "next/link";

// Hardcoded specialties - replace with database call when available
const specialties = [
  "Anxiety",
  "Depression",
  "ADHD",
  "Trauma",
  "Couples Therapy",
  "Family Therapy",
  "Addiction",
  "Eating Disorders",
  "Stress Management",
  "Grief & Loss",
  "OCD",
  "Bipolar Disorder",
];

export default function SpecialtiesSection() {
  return (
    <section className="pt-12 pb-20 sm:pt-16 sm:pb-24">

      
      {/* // TODO: When clicked on a specialty, it should filter by that specialty on the search bar (focusing the bar) */}
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {specialties.map((specialty, index) => (
              <span
                key={index}
                className="inline-flex items-center px-6 py-3 rounded-full border cursor-pointer border-gray-300 bg-white text-lg text-gray-700 hover:bg-indigo-600 hover:text-white transition-all duration-400"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
