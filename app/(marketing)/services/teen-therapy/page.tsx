import FAQHomepage from "@/components/faq-homepage";
import { TherapistsCarousel } from "@/components/therapists-carousel";
import Container from "@/components/container";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const faqs = [
  {
    id: "item-1",
    question: "How do I know if my teen needs therapy?",
    answer:
      "Signs can include withdrawal from friends or activities, changes in sleep or appetite, declining grades, persistent sadness or irritability, or talking about feeling hopeless. Trust your instincts, if something feels off, it's worth exploring.",
  },
  {
    id: "item-2",
    question: "Will I know what my teen talks about in sessions?",
    answer:
      "Confidentiality is important for teens to open up. Your therapist will keep most things private, but will involve you if there are safety concerns. They'll also help improve family communication so you stay connected.",
  },
  {
    id: "item-3",
    question: "What if my teen doesn't want to go?",
    answer:
      "Resistance is normal. Many teens warm up once they realize therapy is a judgment-free space where they're in control. A good therapist knows how to meet teens where they are and build trust at their pace.",
  },
  {
    id: "item-4",
    question: "How is teen therapy different from adult therapy?",
    answer:
      "Teen therapists understand adolescent development and use approaches that resonate with young people. Sessions might be more interactive, and therapists are skilled at connecting with teens who might be skeptical at first.",
  },
  {
    id: "item-5",
    question: "Can therapy help with school issues?",
    answer:
      "Absolutely. Whether it's academic pressure, social struggles, bullying, or motivation, therapy helps teens develop coping skills and confidence. Some therapists also coordinate with schools when helpful.",
  },
];

export default function TeenTherapyPage() {
  return (
    <main className="overflow-hidden">
      {/* Hero - Organic flowing design */}
      <section className="relative py-20 sm:py-32 mt-6">
        <Container>
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-gray-900 mb-6">
              A safe space to{" "}
              <span className="inline-block relative">
                <span className="relative z-10">be heard</span>
                <span className="absolute -bottom-2 left-0 pt-2 w-full h-2 bg-purple-300/40 -rotate-1 -z-10" />
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl">
              Teen therapy gives young people a safe space to talk about what's really going on,
              build coping skills, and navigate the challenges of growing up.
            </p>
          </div>
        </Container>
      </section>

      {/* Testimonial - Simple and elegant */}
      <section className="py-16 sm:py-24 relative">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 leading-relaxed mb-8">
              "I didn't want to go at first. But now it's the one place where I feel like someone{" "}
              <span className="relative inline-block">
                <span className="relative z-10">actually listens</span>
                <span className="absolute bottom-1 left-0 w-full h-2 bg-rose-200/40 -rotate-1 -z-10" />
              </span>{" "}
              without telling me what to do."
            </p>
            <p className="text-base sm:text-lg text-gray-500 font-light">— Sofia, 16 years old</p>
          </div>
        </Container>
      </section>

      {/* What therapy helps with - Flowing, asymmetric layout */}
      <section className="py-16 sm:py-24 relative">
        <Container>
          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-light text-gray-900 mb-6 leading-tight">
              The teenage years bring unique challenges
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Adolescence is a time of massive change, physically, emotionally, socially. Therapy
              helps teens make sense of it all and develop skills they'll carry into adulthood.
            </p>
          </div>

          {/* Flowing list with varying indentation */}
          <div className="space-y-12 max-w-5xl">
            <div className="ml-0 max-w-2xl">
              <h3 className="text-2xl sm:text-3xl font-normal text-gray-900 mb-3 relative inline-block">
                Anxiety and overwhelm
                <span className="absolute -bottom-1 left-0 w-24 h-0.5 bg-purple-300/60" />
              </h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mt-4 font-light">
                School pressure, social media, future worries, learn to manage it all without
                burning out.
              </p>
            </div>

            <div className="ml-8 sm:ml-16 max-w-2xl">
              <h3 className="text-2xl sm:text-3xl font-normal text-gray-900 mb-3 relative inline-block">
                Depression and low mood
                <span className="absolute -bottom-1 left-0 w-24 h-0.5 bg-rose-300/60" />
              </h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mt-4 font-light">
                When everything feels heavy or pointless. Find support to rediscover energy and
                hope.
              </p>
            </div>

            <div className="ml-4 sm:ml-8 max-w-2xl">
              <h3 className="text-2xl sm:text-3xl font-normal text-gray-900 mb-3 relative inline-block">
                Identity and self-discovery
                <span className="absolute -bottom-1 left-0 w-24 h-0.5 bg-indigo-300/60" />
              </h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mt-4 font-light">
                Explore who you are, your values, identity, and what matters to you, without
                judgment.
              </p>
            </div>

            <div className="ml-12 sm:ml-24 max-w-2xl">
              <h3 className="text-2xl sm:text-3xl font-normal text-gray-900 mb-3 relative inline-block">
                Friendships and peer pressure
                <span className="absolute -bottom-1 left-0 w-24 h-0.5 bg-pink-300/60" />
              </h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mt-4 font-light">
                Navigate social dynamics, set boundaries, and build relationships that feel genuine.
              </p>
            </div>

            <div className="ml-0 sm:ml-4 max-w-2xl">
              <h3 className="text-2xl sm:text-3xl font-normal text-gray-900 mb-3 relative inline-block">
                Family conflicts
                <span className="absolute -bottom-1 left-0 w-24 h-0.5 bg-purple-300/60" />
              </h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mt-4 font-light">
                When home feels tense or communication has broken down. Find ways to reconnect.
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
              Therapy that meets teens where they are
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Our therapists specialize in working with young people. They use approaches that
              resonate with teens and adapt to each individual's needs and communication style.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10 max-w-5xl">
            <div className="space-y-3">
              <h3 className="text-xl font-medium text-gray-900">
                Cognitive Behavioral Therapy (CBT)
              </h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Practical tools to challenge negative thoughts, manage anxiety, and build healthier
                mental habits.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-medium text-gray-900">
                Dialectical Behavior Therapy (DBT)
              </h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Skills for managing intense emotions, improving relationships, and building distress
                tolerance.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-medium text-gray-900">Art and Creative Therapy</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Express feelings through creative outlets when words feel difficult. No artistic
                skill required.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-medium text-gray-900">Person-Centered Therapy</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                A supportive space where teens lead the conversation and explore their experiences
                at their own pace.
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
              Find a therapist they'll connect with
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              The right fit matters, especially for teens. Browse our specialists who are
              experienced in working with young people and building trust.
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
