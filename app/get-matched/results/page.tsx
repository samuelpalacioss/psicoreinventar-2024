import { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Your Matches | Psicoreinventar",
  description: "View therapists matched to your needs and preferences.",
};

export default function ResultsPage() {
  // TODO: Fetch actual matches based on form submission
  // For now, show a placeholder that matches the organic design

  return (
    <main className="min-h-screen bg-gray-50/50">
      <section className="py-16 sm:py-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-light text-gray-900 leading-tight mb-6">
              Thank you for{" "}
              <span className="relative inline-block">
                <span className="relative z-10">sharing</span>
                <span className="absolute -bottom-2 left-0 w-full h-3 bg-indigo-300/40 -rotate-1 -z-10" />
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8">
              We're analyzing your responses to find therapists who match
              your needs. You'll receive your personalized matches via
              email shortly.
            </p>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
              <h2 className="text-xl font-medium text-gray-900 mb-4">
                What happens next?
              </h2>
              <div className="space-y-4 text-left max-w-md mx-auto">
                <div className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-medium">
                    1
                  </span>
                  <p className="text-gray-600 leading-relaxed">
                    Check your email for your personalized therapist matches
                  </p>
                </div>
                <div className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-medium">
                    2
                  </span>
                  <p className="text-gray-600 leading-relaxed">
                    Review therapist profiles and find one that resonates
                  </p>
                </div>
                <div className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-medium">
                    3
                  </span>
                  <p className="text-gray-600 leading-relaxed">
                    Book a free consultation to see if it's the right fit
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline">
                <Link href="/find">Browse all therapists</Link>
              </Button>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link href="/">Return home</Link>
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-8">
              Didn't receive an email? Check your spam folder or{" "}
              <Link href="/contact" className="text-indigo-600 hover:underline">
                contact us
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}
