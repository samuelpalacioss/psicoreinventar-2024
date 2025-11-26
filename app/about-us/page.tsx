import Container from "@/components/container";

export default function AboutPage() {

  return (
    <>
      <main>
        {/* Hero Section */}
        <section className="relative py-20 sm:py-32 overflow-hidden">
          {/* Background blobs */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
            <div className="absolute top-20 left-20 w-96 h-96 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
          </div>

          <Container>
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl sm:text-6xl font-normal tracking-tight text-gray-900 mb-6">
                Reinventing mental healthcare, one connection at a time
              </h1>
              <p className="text-lg leading-relaxed text-gray-600 max-w-3xl mx-auto">
                <span className="font-medium">Psicoreinventar</span> —{" "}
                <span className="italic">&quot;Psico&quot; (psychology) + &quot;Reinventar&quot; (reinvent)</span> — reflects our
                mission to modernize how mental health professionals and patients connect.
              </p>
            </div>
          </Container>
        </section>

        {/* Mission Section */}
        <section className="py-16 sm:py-24 bg-gray-50/50">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-normal tracking-tight text-gray-900 mb-8">
                Our Mission
              </h2>
              <div className="space-y-6 text-lg leading-relaxed text-gray-600">
                <p>
                  Psicoreinventar helps individuals find the right mental health specialist for their unique
                  needs while empowering healthcare professionals to{" "}
                  <span className="font-medium text-gray-900">streamline their workflows and save valuable time</span>.
                </p>
                <p>
                  The platform ensures{" "}
                  <span className="font-medium text-gray-900">accessibility and transparency</span> in mental
                  healthcare by connecting patients with verified specialists based on specific needs,
                  specialties, and availability.
                </p>
                <p>
                  For specialists, we automate administrative tasks, reduce scheduling overhead, and eliminate
                  time-consuming manual processes — allowing you to focus on what matters most:{" "}
                  <span className="font-medium text-gray-900">patient care</span>.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* Who We Serve Section */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          {/* Decorative blob */}
          <div className="absolute top-20 right-0 w-96 h-96 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>

          <Container>
            <div className="max-w-3xl mb-20">
              <h2 className="text-4xl md:text-5xl font-normal tracking-tight text-gray-900 mb-4">
                Who We Serve
              </h2>
              <p className="text-base leading-relaxed text-gray-600">
                We bring together three essential parts of the mental healthcare ecosystem.
              </p>
            </div>

            {/* Patients */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-20">
              <div>
                <h3 className="text-3xl sm:text-4xl font-normal text-gray-900 leading-tight">
                  Patients & Users
                </h3>
              </div>
              <div className="relative pl-6 lg:pl-8">
                <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-full"></div>
                <p className="text-lg leading-relaxed text-gray-600">
                  Discover qualified therapists based on specialty, location, availability, and your personal
                  preferences. We make mental healthcare accessible and transparent.
                </p>
              </div>
            </div>

            {/* Specialists */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-20">
              <div>
                <h3 className="text-3xl sm:text-4xl font-normal text-gray-900 leading-tight">
                  Mental Health Specialists
                </h3>
              </div>
              <div className="relative pl-6 lg:pl-8">
                <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-full"></div>
                <p className="text-lg leading-relaxed text-gray-600">
                  Psychologists, psychiatrists, therapists, and counselors reduce administrative burden
                  while we handle scheduling, reminders, and practice management.
                </p>
              </div>
            </div>

            {/* Organizations */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <div>
                <h3 className="text-3xl sm:text-4xl font-normal text-gray-900 leading-tight">
                  Healthcare Organizations
                </h3>
              </div>
              <div className="relative pl-6 lg:pl-8">
                <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-full"></div>
                <p className="text-lg leading-relaxed text-gray-600">
                  Streamline referrals and improve patient-specialist matching across your healthcare
                  organization with our platform.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* Our Approach Section */}
        <section className="py-16 sm:py-24 bg-gray-50/50">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <div>
                <h2 className="text-4xl md:text-5xl font-normal tracking-tight text-gray-900 mb-6">
                  We&apos;re building a better way
                </h2>
                <p className="text-lg leading-relaxed text-gray-600">
                  Technology should eliminate barriers, not create them. We&apos;re reimagining mental healthcare from the ground up.
                </p>
              </div>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">Everything out in the open</h3>
                  <p className="text-base leading-relaxed text-gray-600">
                    See credentials, availability, and pricing upfront. Know exactly what to expect before booking
                    your first session. No hidden fees, no back-and-forth calls.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">We handle the busy work</h3>
                  <p className="text-base leading-relaxed text-gray-600">
                    Scheduling, reminders, records, and billing happen automatically in the background.
                    Spend time on conversations that matter, not paperwork.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">Your information stays private</h3>
                  <p className="text-base leading-relaxed text-gray-600">
                    Medical-grade security keeps your conversations and records completely confidential.
                    We meet the same strict privacy standards as hospitals and clinics.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}
