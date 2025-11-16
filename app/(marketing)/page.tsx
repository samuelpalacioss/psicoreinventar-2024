import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { CircleBackground } from "@/components/circle-background";
import Container from "@/components/container";
import { FeatureItem } from "@/types";
import { marketingConfig } from "@/config/marketing";
import SpecialtiesSection from "@/components/specialties-section";
import FAQHomepage from "@/components/faq-homepage";
import { TherapistsCarousel } from "@/components/therapists-carousel";
import FeatureShowcase from "@/components/feature-showcase";

export default function MarketingPage() {
  const steps = marketingConfig.steps;

  return (
    <>
      <main>
        <section id="hero" className="py-20 sm:py-36">
          <Container>
            <div className=" gap-x-6 lg:mx-0 sm:flex lg:max-w-none lg:items-center">
              <div className="w-full max-w-xl lg:shrink-0 basis-4/6 xl:max-w-2xl">
                <h1 className="text-4xl s font-semibold tracking-tight text-black-900 sm:text-6xl">
                  Wellness starts with your mental health
                </h1>
                <div className="mt-6 max-w-xl space-y-2">
                  <p className="text-base leading-7 text-gray-600 max-w-md lg:max-w-full">
                    Discover the gateway to a fulfilling life with our focused approach to mental
                    well-being. From personalized support to comprehensive strategies, we empower
                    you to prioritize your mental health for a brighter future.
                  </p>
                  <div className="flex items-center gap-x-6">
                    <Link
                      href="/login"
                      className={cn(buttonVariants({ variant: "default", size: "lg" }), "mt-4 text-sm font-semibold transition-all px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700")}

                    >
                      Get started
                    </Link>
                    <Link
                      href="/#about"
                      className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-4 text-sm font-semibold")}
                    >
                      Learn more{" "}
                      <span className="font-semibold" aria-hidden="true">
                        &rarr;
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="flex basis-2/6">
                <div className="max-w-xs sm:max-w-lg pt-16 lg:pt-0 xl:order-0">
                  <Image
                    src="https://pub-a73a0280999e4a0cbf0918b31f9f798b.r2.dev/couple-hugging717622425.jpg"
                    alt="Therapist hugging patient in therapy session"
                    width={996}
                    height={859}
                    className="w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                    sizes="(min-width: 1340px) 405px, (min-width: 640px) calc(31.76vw - 14px), (min-width: 400px) 280px, calc(65vw + 73px)"
                    priority={true}
                  />
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <div className="wrapper">
        <section id="features" className="py-20 sm:py-24 bg-gray-50/50">
          <Container>
            <div className="max-w-3xl mb-12">
              <h2 className="text-4xl md:text-5xl font-normal tracking-tight text-gray-900 mb-4">
                Start where you are
              </h2>
              <p className="text-base leading-relaxed text-gray-600">
                Share what brings you here, and we&apos;ll connect you with a therapist who can
                help.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
              {steps.map((step, index) => {
                const stepNumber = String(index + 1);

                return (
                  <div
                    key={index}
                    className={`space-y-4 ${index > 0 ? "md:border-l md:border-gray-300 md:pl-10 lg:pl-12" : ""}`}
                  >
                    <div className="text-6xl  font-normal text-gray-900 leading-none mb-2">
                      {stepNumber}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold leading-tight text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-base leading-relaxed text-gray-600">{step.description}</p>
                    <Link
                      href="/login"
                      className="inline-block text-base font-medium text-gray-900 underline underline-offset-4 hover:text-gray-700 transition-colors mt-2"
                    >
                      {step.cta}
                    </Link>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>

        <section id="specialists" className="py-20 sm:py-24">
          <Container>
            <div className="flex flex-col md:flex-row items-start md:items-start justify-between gap-8 w-full">
              <div className="flex-1 max-w-xl">
                <h2 className="text-4xl md:text-5xl font-normal tracking-tight text-gray-900 mb-2 md:mb-0">
                  The right therapist for you is already here
                </h2>
              </div>
              <div className="flex-1 max-w-xl flex flex-col md:items-start md:self-start">
                <p className="text-lg leading-relaxed text-gray-600 mb-2">
                  Our therapists specialize in a wide range of specialties. Whatever you&apos;re navigating, we&apos;re here to support you.
                </p>
                <Link
                  href="/specialists"
                  className={cn(buttonVariants({ variant: "default", size: "lg" }), "mt-4 text-sm font-semibold")}
                >
                    Find a therapist
                </Link>
              </div>
            </div>
          </Container>
        </section>


        <TherapistsCarousel />

        
        <SpecialtiesSection />

        <FeatureShowcase />

        <section id="cta" className="pb-20 sm:pb-24">
          <div className="relative isolate overflow-hidden bg-gray-900 py-24 text-center shadow-2xl">
            <div className="absolute left-20 top-1/2 -translate-y-1/2 sm:left-1/2 sm:-translate-x-1/2">
              <CircleBackground color="#fff" className="animate-spin-slower" />
            </div>
            <Container className="relative">
              <div className="mx-auto max-w-md sm:text-center">
                <h6 className="text-3xl sm:text-4xl font-medium tracking-tight text-white">
                  Start Your Journey to Emotional Well-Being Today
                </h6>
                <p className="mt-4 text-base text-slate-200">
                  Ready to take a step towards a brighter tomorrow? Let&apos;s embark on this
                  journey together! Click below to start your path towards healing and happiness.
                </p>
                <Link
                  href="/"
                  className={cn(buttonVariants({ variant: "outline" }), "mt-4 gap-x-1")}
                >
                  Get started{" "}
                  <span className="font-semibold" aria-hidden="true">
                    &rarr;
                  </span>
                </Link>
              </div>
            </Container>

            <div
              className="absolute -top-24 right-0 -z-10 transform-gpu blur-3xl"
              aria-hidden="true"
            >
              <div
                className="aspect-1404/767 w-351 bg-linear-to-r from-[#80caff] to-[#4f46e5] opacity-25"
                style={{
                  clipPath:
                    "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)",
                }}
              />
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto pb-20">
          <FAQHomepage />
        </div>
      </div>
    </>
  );
}
