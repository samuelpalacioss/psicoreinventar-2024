import { MarketingConfig } from '@/types';

export const marketingConfig: MarketingConfig = {
  mainNav: [
    { title: 'How it works', href: '/#about' },
    { title: 'Services', href: '/services' },
    { title: 'Specialists', href: '/specialists' },
  ],
  features: [
    {
      name: 'Register and Login',
      description: 'Sign up with your details and log in to access our services.',
      icon: 'user',
    },
    {
      name: 'Book Your Session',
      description:
        'Choose the type of session you need, pick your preferred psychologist, and pick a suitable session time.',
      icon: 'booking',
    },
    {
      name: 'Start Your Therapy Journey',
      description:
        'Complete your payment and your appointment will be confirmed. Begin your journey towards mental well-being.',
      icon: 'mind',
    },
  ],
  testimonials: [
    {
      author: {
        name: 'John Doe',
        imageUrl: `https://ui-avatars.com/api/?name=John+Doe&background=4f46e5&color=fff`,
      },
      rating: 4,
      body: 'I felt heard and understood. The psychologist was very professional and the session was very helpful.',
    },
    {
      author: {
        name: 'Jane Smith',
        imageUrl: `https://ui-avatars.com/api/?name=Jane+Smith&background=4f46e5&color=fff`,
      },
      rating: 5,
      body: 'I was skeptical about online therapy at first, but this service has changed my mind. Highly recommended!',
    },
    {
      author: {
        name: 'Robert Johnson',
        imageUrl: `https://ui-avatars.com/api/?name=Robert+Johnson&background=4f46e5&color=fff`,
      },
      rating: 5,
      body: 'The psychologist was very understanding and helpful. The online platform was easy to use.',
    },
    {
      author: {
        name: 'Emily Davis',
        imageUrl: `https://ui-avatars.com/api/?name=Emily+Davis&background=4f46e5&color=fff`,
      },
      rating: 4,
      body: 'The service was great, and the psychologist was very professional. I felt comfortable discussing my issues.',
    },
    {
      author: {
        name: 'Michael Miller',
        imageUrl: `https://ui-avatars.com/api/?name=Michael+Miller&background=4f46e5&color=fff`,
      },
      rating: 5,
      body: 'The online psychology appointment service was very efficient. I was able to schedule an appointment easily and the session was very helpful.',
    },
    {
      author: {
        name: 'Sarah Brown',
        imageUrl: `https://ui-avatars.com/api/?name=Sarah+Brown&background=4f46e5&color=fff`,
      },
      rating: 4,
      body: 'I found the service to be very beneficial. The psychologist was knowledgeable and empathetic.',
    },
  ],
};
