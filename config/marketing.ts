import { MarketingConfig } from '@/types';

export const marketingConfig: MarketingConfig = {
  mainNav: [
    { title: 'How it works', href: '/#about' },
    { title: 'Services', href: '/services' },
    { title: 'Specialists', href: '/specialists' },
  ],
  steps: [

      {
        title: "Tell us what you need",
        description: "Answer a few questions to help us understand your needs, preferences and goals, so you know exactly what to expect.",
        cta: "Begin your journey"
      },
      {
        title: "Choose your therapist",
        description: "Filter therapists by specialty, availability, approach and identity. Find someone who truly fits you.",
        cta: "Find your therapist"
      },
      {
        title: "Book and begin",
        description: "Book instantly online, schedule at a time that works for you. Begin your journey towards mental well-being.",
        cta: "Get care this week"
      }
    
  ],
  stats: [
    {
      description: 'Clients have started their therapy journey with us',
      value: '3,000+',
    },
    {
      description: 'Clients have found their therapist on the first try',
      value: '95%',
    },
    {
      description: 'The average time to schedule an appointment',
      value: '5 min',
    },
    {
      description: 'Confidentiality and respect for our clients',
      value: '100%',
    },
  ],
  testimonials: [
    {
      author: {
        name: 'Wes Jackson',
        imageUrl: `https://res.cloudinary.com/dzgjxwvnw/image/upload/v1710270926/psicoreinventar/eujppqpx1ryd2uaafgcr.jpg`,
      },
      rating: 4,
      body: 'I felt heard and understood. The psychologist was very professional and the session was very helpful.',
    },
    {
      author: {
        name: 'Sophia Davis',
        imageUrl: `https://res.cloudinary.com/dzgjxwvnw/image/upload/v1710270926/psicoreinventar/wv6j2vy7yanpqqqo6tpc.jpg`,
      },
      rating: 5,
      body: 'I was skeptical about online therapy at first, but this service has changed my mind. Highly recommended!',
    },
    {
      author: {
        name: 'Robert Johnson',
        imageUrl: `https://res.cloudinary.com/dzgjxwvnw/image/upload/v1710270926/psicoreinventar/qi8iyeuwj1vmkjhwkwtm.jpg`,
      },
      rating: 5,
      body: 'The psychologist was very understanding and helpful. The platform was easy to use and smooth.',
    },
    {
      author: {
        name: 'Malissa Liu',
        imageUrl: `https://res.cloudinary.com/dzgjxwvnw/image/upload/v1710270926/psicoreinventar/cpv7shqgamdctwkzcczd.jpg`,
      },
      rating: 4,
      body: 'The service was great, and the psychologist was very professional. I felt comfortable discussing my issues.',
    },
    {
      author: {
        name: 'Michael Miller',
        imageUrl: `https://res.cloudinary.com/dzgjxwvnw/image/upload/v1710270926/psicoreinventar/qi1cjaxdedmjogyxx2jn.jpg`,
      },
      rating: 5,
      body: 'The service was very efficient. I schedule an appointment easily and the session was very helpful.',
    },
  ],
};
