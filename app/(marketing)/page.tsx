import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { CircleBackground } from "@/components/circle-background";
import Container from "@/components/container";
import { FeatureItem, TestimonialItem } from "@/types";
import { dashboardConfig } from "@/config/dashboard";
import { marketingConfig } from "@/config/marketing";
import ReviewsCarousel from "@/components/carousel-reviews";
import Stats from "@/components/stats";
import FAQHomepage from "@/components/faq-homepage";

export default function MarketingPage() {
  const features = marketingConfig.features;
  const testimonials = marketingConfig.testimonials;
  const stats = marketingConfig.stats;

  return (
    <>
      <main>
        <section id="hero" className="py-20 sm:py-36">
          <Container>
            <div className=" gap-x-6 lg:mx-0 sm:flex lg:max-w-none lg:items-center">
              <div className="w-full max-w-xl lg:shrink-0 basis-4/6 xl:max-w-2xl">
                <h1 className="text-4xl s font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Wellness Starts With Your <span className="text-indigo-600">Mental Health</span>
                </h1>
                <div className="mt-6 max-w-xl">
                  <p className="text-base leading-7 text-gray-600 max-w-md lg:max-w-full">
                    Discover the gateway to a fulfilling life with our focused approach to mental well-being.
                    From personalized support to comprehensive strategies, we empower you to prioritize your
                    mental health for a brighter future.
                  </p>
                  <div className="mt-10 flex items-center gap-x-6">
                    <Link
                      href="/login"
                      className={cn(buttonVariants({ variant: "default" }), "bg-indigo-600 text-white ")}
                    >
                      Get started
                    </Link>
                    <Link href="/#about" className={cn(buttonVariants({ variant: "outline" }), "gap-x-1")}>
                      Learn more{" "}
                      <span className="font-semibold" aria-hidden="true">
                        &rarr;
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="flex basis-2/6">
                <div className="max-w-xs sm:max-w-lg pt-16 lg:pt-0 xl:order-none">
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
        <section id="about" className="hidden md:block">
          <Stats stats={stats} />
        </section>
        <section id="about" className="mt-3 py-20 sm:py-24">
          <Container>
            <div className="max-w-2xl lg:mx-0">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                Easy Booking Process
              </h2>
              <p className="mt-6 text-base leading-7 text-gray-600">
                Quickly book your therapy session online. Choose your psychologist, session type, and time,
                then pay securely. Prioritize your mental health effortlessly.
              </p>
            </div>
            <div className="mt-16 sm:mt-20 lg:mt-24">
              {/* md:max-w-2xl  */}
              <div className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2 md:gap-y-10 lg:grid-cols-3">
                {features.map((feature, index) => {
                  const Icon = Icons[feature.icon];
                  return (
                    <div
                      key={index}
                      className="flex flex-col rounded-2xl border border-gray-200 shadow-md p-8"
                    >
                      <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                        <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                      <h3 className="text-base font-semibold leading-7 text-gray-900">
                        {index + 1}. {"  "}
                        {feature.name}
                      </h3>
                      <p className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </Container>
        </section>

        {/* <section id="testimonials" className="py-20 sm:py-24">
          <Container>
            <div className="testimonials-header max-w-xl mb-6">
              <h4 className="text-lg font-bold leading-8 tracking-tight text-indigo-600">Testimonials</h4>
              <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-4xl max-w-">
                Insights into Their Journey
              </p>
            </div>
            <ReviewsCarousel items={marketingConfig.testimonials} />
          </Container>
        </section> */}

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
                  Ready to take a step towards a brighter tomorrow? Let&apos;s embark on this journey
                  together! Click below to start your path towards healing and happiness.
                </p>
                <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "mt-4 gap-x-1")}>
                  Get started{" "}
                  <span className="font-semibold" aria-hidden="true">
                    &rarr;
                  </span>
                </Link>
              </div>
            </Container>

            <div className="absolute -top-24 right-0 -z-10 transform-gpu blur-3xl" aria-hidden="true">
              <div
                className="aspect-[1404/767] w-[87.75rem] bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-25"
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
