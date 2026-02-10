import { Metadata } from "next";
import Container from "@/components/container";
import { IntakeForm } from "@/components/intake-form";

export const metadata: Metadata = {
  title: "Find Your Therapist | Psicoreinventar",
  description:
    "Answer a few questions to get matched with the right therapist for you. Our personalized matching helps you find mental health support that fits your needs.",
};

export default function GetMatchedPage() {
  return (
    <main className="min-h-screen bg-gray-50/50">
      <section className="py-8 sm:py-12">
        <Container>
          {/* Header */}
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-light text-gray-900 leading-tight mb-3">
              Find your perfect match
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Answer a few questions and we'll connect you with therapists who understand your
              unique needs.
            </p>
          </div>

          {/* Form */}
          <IntakeForm />
        </Container>
      </section>
    </main>
  );
}
