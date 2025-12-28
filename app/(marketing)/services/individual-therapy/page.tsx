import FAQHomepage from "@/components/faq-homepage";
import { TherapistsCarousel } from "@/components/therapists-carousel";
import Container from "@/components/container";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const faqs = [
  {
    id: "item-1",
    question: "How long does individual therapy take?",
    answer:
      "Therapy is different for everyone. Some people find relief in a few months, while others benefit from longer-term support. Your therapist will work with you to set goals and check in regularly about progress.",
  },
  {
    id: "item-2",
    question: "What happens in the first session?",
    answer:
      "Your first session is about getting to know each other. You'll share what brings you to therapy, discuss your goals, and ask any questions. Your therapist will explain their approach and together you'll create a plan that feels right for you.",
  },
  {
    id: "item-3",
    question: "Is everything I say confidential?",
    answer:
      "Yes. What you share in therapy stays between you and your therapist, with rare exceptions (like if there's a risk of harm). Your therapist will explain confidentiality limits in your first session.",
  },
  {
    id: "item-4",
    question: "How do I know if therapy is working?",
    answer:
      "You might notice small shifts first—feeling lighter after sessions, handling situations differently, or gaining new perspectives. Your therapist will regularly check in with you about progress and adjust the approach as needed.",
  },
  {
    id: "item-5",
    question: "Can I switch therapists if it's not a good fit?",
    answer:
      "Absolutely. The therapeutic relationship is crucial, and it's completely normal to try a few therapists before finding the right match. We make it easy to switch without any awkwardness or extra fees.",
  },
];

export default function IndividualTherapyPage() {
  return (
    <main className="overflow-hidden">
      {/* Hero - Organic flowing design */}
      <section className="relative py-20 sm:py-32 mt-2">
        {/* Organic background blob */}

        <Container>
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-gray-900 mb-6">
              You don't have to{" "}
              <span className="inline-block relative">
                <span className="relative z-10">figure it out</span>
                <span className="absolute -bottom-2 left-0 pt-2 w-full h-2 bg-indigo-300/40 -rotate-1 -z-10" />
              </span>{" "}
              alone
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
              Individual therapy gives you a safe space to explore what's on your mind, work through
              challenges, and discover new ways forward.
            </p>
          </div>
        </Container>
      </section>

      {/* Testimonial - Simple and elegant */}
      <section className="py-16 sm:py-24 relative">
        <div className="absolute left-1/2 top-0 w-[400px] h-[300px] bg-gradient-to-b from-rose-50 to-transparent rounded-full blur-3xl opacity-50 -z-10 -translate-x-1/2" />

        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 leading-relaxed mb-8">
              "I finally feel like someone actually{" "}
              <span className="relative inline-block">
                <span className="relative z-10">gets</span>
                <span className="absolute bottom-1 left-0 w-full h-2 bg-rose-200/40 -rotate-1 -z-10" />
              </span>{" "}
              what I'm going through. It's such a relief to not feel alone in this."
            </p>
            <p className="text-base sm:text-lg text-gray-500 font-light">
              — Michael, 3 months into therapy
            </p>
          </div>
        </Container>
      </section>

      {/* What therapy helps with - Flowing, asymmetric layout */}
      <section className="py-16 sm:py-24 relative">
        {/* Subtle background accent */}
        <div className="absolute right-0 top-1/4 w-64 h-64 bg-gradient-to-l from-indigo-50 to-transparent rounded-full blur-2xl opacity-40" />

        <Container>
          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-light text-gray-900 mb-6 leading-tight">
              Whatever you're going through
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Therapy isn't just for crisis moments. It's for anyone who wants to understand
              themselves better, work through something difficult, or grow in new directions.
            </p>
          </div>

          {/* Flowing list with varying indentation */}
          <div className="space-y-12 max-w-5xl">
            <div className="ml-0 max-w-2xl">
              <h3 className="text-2xl sm:text-3xl font-normal text-gray-900 mb-3 relative inline-block">
                Anxiety, stress, or feeling overwhelmed
                <span className="absolute -bottom-1 left-0 w-24 h-0.5 bg-indigo-300/60" />
              </h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mt-4 font-light">
                When worry takes over, therapy helps you find calm and clarity.
              </p>
            </div>

            <div className="ml-8 sm:ml-16 max-w-2xl">
              <h3 className="text-2xl sm:text-3xl font-normal text-gray-900 mb-3 relative inline-block">
                Depression or loss of interest
                <span className="absolute -bottom-1 left-0 w-24 h-0.5 bg-rose-300/60" />
              </h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mt-4 font-light">
                Rediscover energy, purpose, and connection to the things that matter.
              </p>
            </div>

            <div className="ml-4 sm:ml-8 max-w-2xl">
              <h3 className="text-2xl sm:text-3xl font-normal text-gray-900 mb-3 relative inline-block">
                Life transitions and big changes
                <span className="absolute -bottom-1 left-0 w-24 h-0.5 bg-purple-300/60" />
              </h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mt-4 font-light">
                Career shifts, relationships, moves—navigate uncertainty with support.
              </p>
            </div>

            <div className="ml-12 sm:ml-24 max-w-2xl">
              <h3 className="text-2xl sm:text-3xl font-normal text-gray-900 mb-3 relative inline-block">
                Grief and loss
                <span className="absolute -bottom-1 left-0 w-24 h-0.5 bg-pink-300/60" />
              </h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mt-4 font-light">
                Process difficult experiences and find ways to move forward.
              </p>
            </div>

            <div className="ml-0 sm:ml-4 max-w-2xl">
              <h3 className="text-2xl sm:text-3xl font-normal text-gray-900 mb-3 relative inline-block">
                Self-worth and identity
                <span className="absolute -bottom-1 left-0 w-24 h-0.5 bg-indigo-300/60" />
              </h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mt-4 font-light">
                Build confidence and explore who you are without judgment.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Approaches - Simplified, less card-heavy */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="max-w-3xl mb-12">
            <h2 className="text-4xl sm:text-5xl font-normal text-gray-900 mb-6">
              Different approaches, one goal
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our therapists use evidence-based methods tailored to you. You don't need to know
              which one is right—your therapist will help you figure that out together.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10 max-w-5xl">
            <div className="space-y-3">
              <h3 className="text-xl font-medium text-gray-900">
                Cognitive Behavioral Therapy (CBT)
              </h3>
              <p className="text-base text-gray-600 leading-relaxed">
                A practical approach focused on changing thought patterns and behaviors that keep
                you stuck.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-medium text-gray-900">Psychodynamic Therapy</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Explore how past experiences shape your present. Gain insight into patterns you
                didn't know were there.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-medium text-gray-900">Mindfulness-Based Therapy</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Learn to stay present and respond to challenges with clarity instead of reacting
                automatically.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-medium text-gray-900">
                Acceptance and Commitment Therapy (ACT)
              </h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Accept difficult thoughts and feelings while taking action toward what truly matters
                to you.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Therapists */}
      <section className="pt-16 sm:pt-24 pb-12 sm:pb-16 bg-gray-50/50">
        <Container>
          <div className="max-w-2xl mb-8">
            <h2 className="text-4xl sm:text-5xl font-normal text-gray-900 mb-4">
              Find someone who gets you
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              The right therapist makes all the difference. Browse our specialists and find someone
              whose approach and style feel right.
            </p>
            <Link
              href="/find"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-4 rounded-lg font-medium mt-6"
              )}
            >
              Find a therapist
            </Link>
          </div>
        </Container>
      </section>

      <div className="bg-gray-50/50 pb-16">
        <TherapistsCarousel />
      </div>

      {/* FAQ */}
      <section className="py-16 sm:py-24 bg-gray-50/50">
        <Container>
          <div className="max-w-3xl mx-auto">
            <FAQHomepage title="" subtitle="" faqItems={faqs} />
          </div>
        </Container>
      </section>
    </main>
  );
}
