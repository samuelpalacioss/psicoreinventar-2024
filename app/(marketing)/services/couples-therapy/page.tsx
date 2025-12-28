import FAQHomepage from "@/components/faq-homepage";
import { TherapistsCarousel } from "@/components/therapists-carousel";
import Container from "@/components/container";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const faqs = [
  {
    id: "item-1",
    question: "Do both partners need to want therapy for it to work?",
    answer:
      "Ideally, yes—but it's common for one partner to be more hesitant at first. Many couples find that once they start, both partners see the value. Your therapist can help create a safe space where both of you feel heard.",
  },
  {
    id: "item-2",
    question: "What if we're not sure we want to stay together?",
    answer:
      "That's okay. Couples therapy isn't just about staying together—it's about gaining clarity. Whether you decide to work on the relationship or part ways, therapy helps you do so with understanding and intention.",
  },
  {
    id: "item-3",
    question: "Will the therapist take sides?",
    answer:
      "No. A good couples therapist remains neutral and focuses on the relationship itself. Their role is to help both of you communicate better and understand each other, not to judge who's right or wrong.",
  },
  {
    id: "item-4",
    question: "How long does couples therapy usually take?",
    answer:
      "It varies widely depending on your goals and challenges. Some couples see progress in 8-12 sessions, while others benefit from longer-term work. Your therapist will check in regularly about what's working.",
  },
  {
    id: "item-5",
    question: "Can we do individual sessions too?",
    answer:
      "Yes. Many therapists offer occasional individual sessions alongside couples work. This can help each partner process things privately. Your therapist will discuss what approach makes sense for your situation.",
  },
];

export default function CouplesTherapyPage() {
  return (
    <main className="overflow-hidden">
      {/* Hero - Organic flowing design */}
      <section className="relative py-20 sm:py-32 mt-2">
        <Container>
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-gray-900 mb-6">
              Relationships take{" "}
              <span className="inline-block relative">
                <span className="relative z-10">work</span>
                <span className="absolute -bottom-2 left-0 pt-2 w-full h-2 bg-rose-200/40 -rotate-1 -z-10" />
              </span>
              , you don't have to do it alone
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
              Couples therapy gives you both a space to be heard, understand each other more deeply,
              and find new ways to connect—even when things feel stuck.
            </p>
          </div>
        </Container>
      </section>

      {/* Testimonial - Simple and elegant */}
      <section className="py-16 sm:py-24 relative">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 leading-relaxed mb-8">
              "We were stuck in the same arguments for years. Now we actually{" "}
              <span className="relative inline-block">
                <span className="relative z-10">hear</span>
                <span className="absolute bottom-1 left-0 w-full h-2 bg-indigo-300/40 -rotate-1 -z-10" />
              </span>{" "}
              each other. It's like we're finally on the same team again."
            </p>
            <p className="text-base sm:text-lg text-gray-500 font-light">
              — Ana & Carlos, 6 months into therapy
            </p>
          </div>
        </Container>
      </section>

      {/* What therapy helps with - Flowing, asymmetric layout */}
      <section className="py-16 sm:py-24 relative">
        <Container>
          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-light text-gray-900 mb-6 leading-tight">
              Every relationship has its struggles
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              You don't need to be in crisis to benefit from couples therapy. It's for anyone who
              wants to strengthen their connection, work through challenges, or simply communicate
              better.
            </p>
          </div>

          {/* Flowing list with varying indentation */}
          <div className="space-y-12 max-w-5xl">
            <div className="ml-0 max-w-2xl">
              <h3 className="text-2xl sm:text-3xl font-normal text-gray-900 mb-3 relative inline-block">
                Communication breakdowns
                <span className="absolute -bottom-1 left-0 w-24 h-0.5 bg-rose-300/60" />
              </h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mt-4 font-light">
                When conversations turn into arguments, or silence feels safer than talking.
              </p>
            </div>

            <div className="ml-8 sm:ml-16 max-w-2xl">
              <h3 className="text-2xl sm:text-3xl font-normal text-gray-900 mb-3 relative inline-block">
                Trust and intimacy issues
                <span className="absolute -bottom-1 left-0 w-24 h-0.5 bg-indigo-300/60" />
              </h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mt-4 font-light">
                Rebuild connection after betrayal, or rediscover closeness that's faded over time.
              </p>
            </div>

            <div className="ml-4 sm:ml-8 max-w-2xl">
              <h3 className="text-2xl sm:text-3xl font-normal text-gray-900 mb-3 relative inline-block">
                Life transitions together
                <span className="absolute -bottom-1 left-0 w-24 h-0.5 bg-purple-300/60" />
              </h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mt-4 font-light">
                New baby, career changes, moving—navigate big shifts as a united team.
              </p>
            </div>

            <div className="ml-12 sm:ml-24 max-w-2xl">
              <h3 className="text-2xl sm:text-3xl font-normal text-gray-900 mb-3 relative inline-block">
                Different needs and expectations
                <span className="absolute -bottom-1 left-0 w-24 h-0.5 bg-pink-300/60" />
              </h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mt-4 font-light">
                Find balance when you want different things from the relationship or life.
              </p>
            </div>

            <div className="ml-0 sm:ml-4 max-w-2xl">
              <h3 className="text-2xl sm:text-3xl font-normal text-gray-900 mb-3 relative inline-block">
                Feeling disconnected
                <span className="absolute -bottom-1 left-0 w-24 h-0.5 bg-indigo-300/60" />
              </h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mt-4 font-light">
                When you're living together but feeling like strangers. Reconnect with intention.
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
              Approaches that bring you closer
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our therapists use proven methods designed specifically for couples. They'll help you
              find what works for your unique relationship.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10 max-w-5xl">
            <div className="space-y-3">
              <h3 className="text-xl font-medium text-gray-900">
                Emotionally Focused Therapy (EFT)
              </h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Understand the emotions driving your conflicts and create new patterns of connection
                and security.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-medium text-gray-900">Gottman Method</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Research-backed techniques to improve friendship, manage conflict, and build shared
                meaning together.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-medium text-gray-900">Narrative Therapy</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Rewrite the stories you tell about your relationship and each other. Find new
                perspectives on old patterns.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-medium text-gray-900">Integrative Approach</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Your therapist draws from multiple methods to create a personalized approach that
                fits your specific needs.
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
              Find the right therapist for both of you
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              A couples therapist needs to connect with both partners. Browse our specialists and
              find someone you both feel comfortable with.
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
