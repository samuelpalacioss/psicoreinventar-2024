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
      <main>
        {/* Hero Section - Natural with subtle organic background */}
        <section className="relative py-20 sm:py-32 overflow-hidden">
          {/* Subtle organic background elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
            <div className="absolute top-20 left-20 w-96 h-96 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
          </div>

          <Container>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-6xl tracking-tight text-gray-900 leading-tight">
                    Build the practice you've always wanted
                  </h1>
                  <p className="text-base leading-7 text-gray-600 max-w-xl">
                    More clients. Less admin. Better work-life balance.
                  </p>
                </div>

                <Link
                  href="/doctor-register"
                  className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all"
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

        {/* Benefits Cards - Asymmetric layout */}
        <section className="py-16 sm:py-24">
          <Container>
            <div className="max-w-3xl mb-12">
              <h2 className="text-4xl md:text-5xl font-normal tracking-tight text-gray-900 mb-4">
                Benefits of Psicoreinventar
              </h2>
            </div>

            {/* Asymmetric grid - natural, handcrafted feel */}
            <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
              {/* First benefit - spans 2 columns */}
              <div className="md:col-span-2 bg-white border border-gray-200 rounded-3xl p-8 lg:p-10 space-y-4 hover:shadow-lg hover:border-gray-300 transition-all duration-300">
                <h3 className="text-xl font-medium text-gray-900">{benefits[0].title}</h3>
                <p className="text-base text-gray-600 leading-relaxed">{benefits[0].description}</p>
              </div>

              {/* Second benefit - single column */}
              <div className="bg-white border border-gray-200 rounded-3xl p-8 space-y-3 hover:shadow-lg hover:border-gray-300 transition-all duration-300">
                <h3 className="text-lg font-medium text-gray-900">{benefits[1].title}</h3>
                <p className="text-base text-gray-600 leading-relaxed">{benefits[1].description}</p>
              </div>

              {/* Save Time - left card, single column */}
              <div className="bg-white border border-gray-200 rounded-3xl p-8 space-y-3 hover:shadow-lg hover:border-gray-300 transition-all duration-300">
                <h3 className="text-lg font-medium text-gray-900">{benefits[3].title}</h3>
                <p className="text-base text-gray-600 leading-relaxed">{benefits[3].description}</p>
              </div>

              {/* Client Management - right card, spans 2 columns */}
              <div className="md:col-span-2 bg-white border border-gray-200 rounded-3xl p-8 lg:p-10 space-y-4 hover:shadow-lg hover:border-gray-300 transition-all duration-300">
                <h3 className="text-xl font-medium text-gray-900">{benefits[2].title}</h3>
                <p className="text-base text-gray-600 leading-relaxed">{benefits[2].description}</p>
              </div>
            </div>
          </Container>
        </section>

        {/* Stats Section */}
        <section className="py-16 sm:py-24">
          <Container>
            <div className="max-w-3xl mb-12">
              <h2 className="text-4xl md:text-5xl font-normal tracking-tight text-gray-900 mb-4">
                Our therapist network
              </h2>
              <p className="text-base leading-relaxed text-gray-600">
                Join a diverse community of therapists helping people across the country.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8">
              {[
                { value: "~500", label: "therapists in the network", color: "bg-indigo-50" },
                { value: "15+", label: "specialties covered", color: "bg-rose-50" },
                { value: "~75%", label: "work remotely", color: "bg-purple-50" },
                { value: "~40%", label: "bilingual therapists", color: "bg-pink-50" },
                { value: "50", label: "states of licensure", color: "bg-indigo-50" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`${stat.color} rounded-3xl p-6 sm:p-8 text-center space-y-2`}
                >
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-normal text-gray-900">
                    {stat.value}
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 leading-snug">{stat.label}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Comparison */}
        <section className="py-16 sm:py-24 bg-gray-50/50">
          <Container>
            <div className="max-w-3xl mb-12 mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-normal tracking-tight text-gray-900 mb-4">
                Why therapists choose us
              </h2>
              <p className="text-base leading-relaxed text-gray-600">
                We handle the business side so you can focus on what matters most, your clients.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              {/* Headers */}
              <div className="grid grid-cols-[1fr_auto_auto] gap-3 sm:gap-8 mb-8 pb-6 border-b-2 border-gray-200">
                <div></div>
                <div className="w-16 sm:w-24 text-center">
                  <div className="inline-block bg-indigo-100 text-indigo-900 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium -rotate-1">
                    With us
                  </div>
                </div>
                <div className="w-16 sm:w-24 text-center">
                  <div className="inline-block bg-gray-100 text-gray-700 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium rotate-1">
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

        {/* FAQ Section */}
        <section className="relative pt-8 sm:pt-12 pb-16 sm:pb-24 overflow-hidden">
          {/* Subtle gradient background that transitions into CTA */}
          <div className="absolute inset-0 -z-10 bg-linear-to-b from-transparent via-indigo-50/30 to-indigo-50/50"></div>

          <Container>
            <div className="max-w-4xl mx-auto">
              <FAQHomepage
                title="Still unsure?"
                subtitle="Let's clear it up"
                faqItems={marketingConfig.therapistFAQ}
              />
            </div>
          </Container>
        </section>

        {/* CTA */}
        <section className="relative pt-20 sm:pt-32 pb-24 sm:pb-40 overflow-hidden">
          {/* Organic gradient background - richer than hero */}
          <div className="absolute inset-0 -z-10 bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
          </div>

          <Container>
            <div className="max-w-3xl mx-auto text-center space-y-8">
              {/* Main headline */}
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-gray-900 leading-tight">
                Ready to build the practice you deserve?
              </h2>

              {/* Supporting copy */}
              <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
                Join hundreds of therapists who've found more clients, better work-life balance, and
                the freedom to practice on their terms.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href="/doctor-register"
                  className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 hover:shadow-lg w-full sm:w-auto"
                >
                  Apply now
                </Link>
                <Link
                  href="#faq"
                  className="inline-block bg-white/80 backdrop-blur-sm text-gray-900 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-white hover:shadow-md transition-all duration-200 border border-gray-200 w-full sm:w-auto"
                >
                  Learn more
                </Link>
              </div>

              {/* Trust indicator */}
              <p className="text-sm text-gray-600 pt-4">
                No upfront costs • Flexible schedule • Cancel anytime
              </p>
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}
