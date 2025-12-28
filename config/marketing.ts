import { MarketingConfig } from "@/types";

export const marketingConfig: MarketingConfig = {
  mainNav: [
    {
      label: "Services",
      submenu: true,
      type: "simple",
      items: [
        {
          href: "/services/individual-therapy",
          label: "Individual Therapy",
        },
        {
          href: "/services/couples-therapy",
          label: "Couples Therapy",
        },
        {
          href: "/services/teen-therapy",
          label: "Teen Therapy",
        },
      ],
    },
    { label: "About us", href: "/about-us" },
    { label: "Resources", href: "/resources" },
    { label: "For Therapists", href: "/for-therapists" },
  ],
  steps: [
    {
      title: "Tell us what you need",
      description:
        "Answer a few questions to help us understand your needs, preferences and goals, so you know exactly what to expect.",
      cta: "Begin your journey",
    },
    {
      title: "Choose your therapist",
      description:
        "Filter therapists by specialty, availability, approach and identity. Find someone who truly fits you.",
      cta: "Find your therapist",
    },
    {
      title: "Book and begin",
      description:
        "Book instantly online, schedule at a time that works for you. Begin your journey towards mental well-being.",
      cta: "Get care this week",
    },
  ],
  stats: [
    {
      description: "Clients report feeling positive changes within the first month",
      value: "+80%",
    },
    {
      description: "Clients found a therapist who matched their needs",
      value: "+90%",
    },
    {
      description: "Average time to book your first appointment",
      value: "10 min",
    },
  ],
  testimonials: [
    {
      author: {
        name: "Wes Jackson",
        imageUrl: `https://res.cloudinary.com/dzgjxwvnw/image/upload/v1710270926/psicoreinventar/eujppqpx1ryd2uaafgcr.jpg`,
      },
      rating: 4,
      body: "I felt heard and understood. The psychologist was very professional and the session was very helpful.",
    },
    {
      author: {
        name: "Sophia Davis",
        imageUrl: `https://res.cloudinary.com/dzgjxwvnw/image/upload/v1710270926/psicoreinventar/wv6j2vy7yanpqqqo6tpc.jpg`,
      },
      rating: 5,
      body: "I was skeptical about online therapy at first, but this service has changed my mind. Highly recommended!",
    },
    {
      author: {
        name: "Robert Johnson",
        imageUrl: `https://res.cloudinary.com/dzgjxwvnw/image/upload/v1710270926/psicoreinventar/qi8iyeuwj1vmkjhwkwtm.jpg`,
      },
      rating: 5,
      body: "The psychologist was very understanding and helpful. The platform was easy to use and smooth.",
    },
    {
      author: {
        name: "Malissa Liu",
        imageUrl: `https://res.cloudinary.com/dzgjxwvnw/image/upload/v1710270926/psicoreinventar/cpv7shqgamdctwkzcczd.jpg`,
      },
      rating: 4,
      body: "The service was great, and the psychologist was very professional. I felt comfortable discussing my issues.",
    },
    {
      author: {
        name: "Michael Miller",
        imageUrl: `https://res.cloudinary.com/dzgjxwvnw/image/upload/v1710270926/psicoreinventar/qi1cjaxdedmjogyxx2jn.jpg`,
      },
      rating: 5,
      body: "The service was very efficient. I schedule an appointment easily and the session was very helpful.",
    },
  ],
  therapistSteps: [
    {
      title: "Create your profile",
      description:
        "Share your expertise, credentials, and approach. Build a profile that showcases what makes you unique and helps clients feel confident choosing you.",
      cta: "Get started",
    },
    {
      title: "Set your availability",
      description:
        "Control your schedule completely. Set your hours, manage appointments, and maintain the work-life balance that works for you.",
      cta: "Learn more",
    },
    {
      title: "Get matched with clients",
      description:
        "Our algorithm connects you with clients who match your specialties and approach. No more marketing stress, we handle client acquisition.",
      cta: "See how it works",
    },
    {
      title: "Start sessions & get paid",
      description:
        "Focus on what matters: helping your clients. We handle scheduling, payments, insurance, and all administrative tasks automatically.",
      cta: "Join now",
    },
  ],
  therapistStats: [
    {
      description: "Save 10+ hours per month on administrative tasks",
      value: "95%",
    },
    {
      description: "New clients in first 30 days",
      value: "8",
    },
    {
      description: "Platform satisfaction rating",
      value: "4.8/5",
    },
  ],
  therapistBenefits: [
    {
      title: "Automated Scheduling",
      description:
        "Calendar sync, instant booking, and automatic reminders. Clients book directly into your available slots, no back and forth needed.",
      icon: "calendar",
    },
    {
      title: "Payment Processing",
      description:
        "Weekly direct deposits, automated invoicing, and insurance verification. Get paid on time, every time, with zero payment chase.",
      icon: "creditCard",
    },
    {
      title: "Client Management",
      description:
        "Secure notes, session history, and progress tracking all in one centralized dashboard. Everything organized, nothing lost.",
      icon: "users",
    },
    {
      title: "Save Time",
      description:
        "We can help you with progress tracking, making the process more visible and efficient.",
      icon: "trendingUp",
    },
  ],
  therapistFAQ: [
    {
      id: "item-1",
      question: "How do I get paid?",
      answer:
        "Payments are processed weekly via direct deposit. We handle all billing, insurance claims, and payment collection. You receive your earnings every Friday for sessions completed the previous week.",
    },
    {
      id: "item-2",
      question: "What's the commission structure?",
      answer:
        "We charge a competitive 10% platform fee. This covers payment processing, insurance verification, marketing, client matching, scheduling infrastructure, and ongoing support. No hidden fees.",
    },
    {
      id: "item-3",
      question: "Can I set my own rates?",
      answer:
        "Yes. You have complete control over your session rates. We provide guidance based on your credentials and location, but the final decision is always yours.",
    },
    {
      id: "item-4",
      question: "How are clients matched to me?",
      answer:
        "Our algorithm considers client needs, your specialties, availability, approach, and preferences.",
    },
    {
      id: "item-5",
      question: "What support do you provide?",
      answer:
        "We provide comprehensive onboarding, ongoing technical support and a dedicated therapist success team. You'll never feel alone on this platform.",
    },
  ],
  homepageFAQ: [
    {
      id: "item-1",
      question: "What is Psicoreinventar?",
      answer:
        "Psicoreinventar connects clients with professional therapists. We want to make therapy accessible to everyone and make it easier to find the right therapist.",
    },
    {
      id: "item-2",
      question: "How do I find the right therapist for me?",
      answer:
        "The right therapist is one who ensures you feel safe and comfortable. We make it easy to find the right therapist. You can browse and filter our therapists based on your specific needs and preferences.",
    },
    {
      id: "item-3",
      question: "How are therapists verified?",
      answer:
        "We conduct an intensive interview process to ensure our therapists have the skills, training, and experience to help you grow.",
    },
    {
      id: "item-4",
      question: "How much will it cost?",
      answer: "Rates are equal for all therapists, the type of session varies the price.",
    },
    {
      id: "item-5",
      question: "How do I schedule an appointment?",
      answer:
        "To schedule an appointment: Select your preferred session type, Choose a therapist that matches your needs, Pick an available time slot from their calendar and Complete the booking process. Once your payment is confirmed, you'll receive all the session details via email.",
    },
  ],
};
