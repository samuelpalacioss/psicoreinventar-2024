import Link from "next/link";
import Container from "@/components/container";
import { marketingConfig } from "@/config/marketing";
import IncomeCalculator from "@/components/income-calculator";
import FAQHomepage from "@/components/faq-homepage";
import { BenefitComparisonRow } from "@/components/benefit-comparison-row";

export default function ForTherapistsPage() {
  const steps = marketingConfig.therapistSteps;
  const stats = marketingConfig.therapistStats;
  const benefits = marketingConfig.therapistBenefits;

  return (
    <>
      <main className="bg-cream">
        {/* Hero Section - Simple and clean */}
        <section className="py-20 sm:py-32">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-6xl font-normal text-gray-900 leading-tight">
                    Build the practice you've always wanted
                  </h1>
                  <p className="text-base leading-7 text-gray-600 max-w-xl">
                    More clients. Less admin. Better work-life balance.
                  </p>
                </div>

                <Link
                  href="/doctor-register"
                  className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
                >
                  Apply now
                </Link>
              </div>

              <div className="lg:pt-8">
                <IncomeCalculator />
              </div>
            </div>
          </Container>
        </section>

        {/* Benefits Cards - Inspired by Talkspace stats */}
        <section className="py-16 sm:py-24">
          <Container>
            <h2 className="text-4xl sm:text-5xl font-normal text-gray-900 mb-16 text-center">
              Benefits of Psicoreinventar
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-8 space-y-3"
                >
                  <h3 className="text-lg font-medium text-gray-900">
                    {benefit.title}
                  </h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Stats Section - Pastel Cards like reference */}
        <section className="py-16 sm:py-24 bg-white">
          <Container>
            <h2 className="text-4xl sm:text-5xl font-normal text-gray-900 mb-16 text-center">
              Our therapist network
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {[
                { value: "~500", label: "therapists in the network", color: "bg-emerald-100" },
                { value: "15+", label: "specialties covered", color: "bg-blue-100" },
                { value: "~75%", label: "work remotely", color: "bg-emerald-100" },
                { value: "~40%", label: "bilingual therapists", color: "bg-blue-100" },
                { value: "50", label: "states of licensure", color: "bg-emerald-100" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`${stat.color} rounded-lg p-6 sm:p-8 text-center space-y-2`}
                >
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-normal text-gray-900">
                    {stat.value}
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 leading-snug">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Comparison - Artsy asymmetric layout */}
        <section className="py-16 sm:py-24 bg-white">
          <Container>
            <h2 className="text-4xl sm:text-5xl font-normal text-gray-900 mb-4 text-center">
              Why therapists choose us
            </h2>
            <p className="text-base text-gray-600 mb-16 text-center max-w-2xl mx-auto">
              We handle the business side so you can focus on what matters most—your clients.
            </p>

            <div className="max-w-3xl mx-auto">
              {/* Headers */}
              <div className="grid grid-cols-[1fr_auto_auto] gap-8 mb-8 pb-6 border-b-2 border-gray-200">
                <div></div>
                <div className="w-24 text-center">
                  <div className="inline-block bg-indigo-100 text-indigo-900 px-4 py-2 rounded-full text-sm font-medium -rotate-1">
                    With us
                  </div>
                </div>
                <div className="w-24 text-center">
                  <div className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium rotate-1">
                    Traditional
                  </div>
                </div>
              </div>

              {/* Feature rows */}
              <div className="space-y-1">
                {benefits.map((benefit, index) => (
                  <BenefitComparisonRow
                    key={index}
                    title={benefit.title}
                    description={benefit.description}
                  />
                ))}
              </div>
            </div>
          </Container>
        </section>



        {/* FAQ Section - Clean like GrowTherapy */}
        <section className="py-16 sm:py-24 bg-white">
          <Container>
            <div className="max-w-3xl mx-auto">
              <FAQHomepage
                title="Still unsure?"
                subtitle="Let's clear it up"
                faqItems={marketingConfig.therapistFAQ}
              />
            </div>
          </Container>
        </section>

        {/* Simple CTA */}
        <section className="py-20 sm:py-32 bg-cream text-center">
          <Container>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-gray-900 mb-8 max-w-3xl mx-auto">
              Ready to build the practice you deserve?
            </h2>
            <Link
              href="/doctor-register"
              className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Apply now
            </Link>
          </Container>
        </section>
      </main>
    </>
  );
}
