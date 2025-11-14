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
]

export default function SpecialtiesSection() {
  return (
    <section className="pt-12 pb-20 sm:pt-16 sm:pb-24">
      <Container>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {specialties.map((specialty, index) => (
              <span
                key={index}
                className="inline-flex items-center px-6 py-3 rounded-full border border-gray-300 bg-white text-lg text-gray-700"
              >
                {specialty}
              </span>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <Link
              href="/specialists"
              className="inline-block text-base font-medium text-gray-900 underline underline-offset-4 hover:text-gray-700 transition-colors"
            >
              Browse all specialists
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

