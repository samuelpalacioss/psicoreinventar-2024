'use client';

import * as React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';

interface TherapistCard {
  id: string;
  name: string;
  title: string;
  image: string;
  description: string;
  width: number;
  height: number;
  size: 'small' | 'medium' | 'tall' | 'wide'; // Controls the item's visual size
}

interface TherapistsCarouselProps {
  therapists?: TherapistCard[];
}

const DEFAULT_THERAPISTS: TherapistCard[] = [
  {
    id: '1',
    name: 'LMFT',
    title: 'LMFT',
    image: 'https://via.placeholder.com/250x300/4f46e5/ffffff?text=Therapist+1',
    description: 'It seems and interactive. I believe in work with clients, respectfully, and.',
    width: 250,
    height: 300,
    size: 'small',
  },
  {
    id: '2',
    name: 'Evan Dunn, LCSW',
    title: 'LCSW',
    image: 'https://via.placeholder.com/320x420/4f46e5/ffffff?text=Evan+Dunn',
    description: 'Evan specializes in working with individuals navigating life transitions and building resilience to reach breakthrough moments and goals.',
    width: 320,
    height: 420,
    size: 'medium',
  },
  {
    id: '3',
    name: 'Hany Urdaneta, LMHC',
    title: 'LMHC',
    image: 'https://via.placeholder.com/380x480/4f46e5/ffffff?text=Hany+Urdaneta',
    description: 'My biggest strengths are listening, and judging, offering healing resources of the bar.',
    width: 380,
    height: 480,
    size: 'tall',
  },
  {
    id: '4',
    name: 'Belinda Valdvia, LCSW',
    title: 'LCSW',
    image: 'https://via.placeholder.com/420x300/4f46e5/ffffff?text=Belinda',
    description: 'My biggest strength is being positive and resilient, offering therapy to make you heal.',
    width: 420,
    height: 300,
    size: 'wide',
  },
  {
    id: '5',
    name: 'Stacy Thiry, LMFT',
    title: 'LMFT',
    image: 'https://via.placeholder.com/300x400/4f46e5/ffffff?text=Stacy+Thiry',
    description: 'My goal is to help people become the best version of themselves.',
    width: 300,
    height: 400,
    size: 'medium',
  },
  {
    id: '6',
    name: 'Additional Therapist',
    title: 'Specialist',
    image: 'https://via.placeholder.com/360x360/4f46e5/ffffff?text=Therapist+6',
    description: 'Dedicated to helping you find peace and balance in your life journey.',
    width: 360,
    height: 360,
    size: 'small',
  },
  {
    id: '7',
    name: 'Sarah Johnson, LCSW',
    title: 'LCSW',
    image: 'https://via.placeholder.com/340x430/4f46e5/ffffff?text=Sarah+Johnson',
    description: 'Specializing in anxiety and depression treatment with evidence-based approaches.',
    width: 340,
    height: 430,
    size: 'medium',
  },
  {
    id: '8',
    name: 'Marcus Williams, LMFT',
    title: 'LMFT',
    image: 'https://via.placeholder.com/400x320/4f46e5/ffffff?text=Marcus+Williams',
    description: 'Expert in couples therapy and relationship counseling for all life stages.',
    width: 400,
    height: 320,
    size: 'wide',
  },
  {
    id: '9',
    name: 'Jennifer Lee, LMHC',
    title: 'LMHC',
    image: 'https://via.placeholder.com/370x490/4f46e5/ffffff?text=Jennifer+Lee',
    description: 'Passionate about trauma-informed care and resilience building.',
    width: 370,
    height: 490,
    size: 'tall',
  },
  {
    id: '10',
    name: 'David Martinez, LCSW',
    title: 'LCSW',
    image: 'https://via.placeholder.com/280x340/4f46e5/ffffff?text=David+Martinez',
    description: 'Focused on helping individuals navigate life transitions and growth.',
    width: 280,
    height: 340,
    size: 'small',
  },
];

// Size mapping for basis widths to create varying carousel item widths
const sizeClassMap = {
  small: 'basis-36 sm:basis-40 md:basis-44',
  medium: 'basis-44 sm:basis-48 md:basis-56',
  tall: 'basis-40 sm:basis-44 md:basis-52',
  wide: 'basis-56 sm:basis-64 md:basis-72',
};

export function TherapistsCarousel({ therapists = DEFAULT_THERAPISTS }: TherapistsCarouselProps) {
  const plugin = React.useRef(
    Autoplay({
      delay: 2000,
    })
  );

  return (
    <section className="py-20 sm:py-24">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-normal tracking-tight text-gray-900 mb-4">
              Meet Our Therapists
            </h2>
            <p className="text-lg leading-relaxed text-gray-600 max-w-2xl">
              Our diverse team of licensed therapists brings expertise, compassion, and personalized care to help you on your journey.
            </p>
          </div>

          <Carousel
            opts={{
              align: 'start',
              loop: true,
              duration: 400,
              watchDrag: false,
            }}
            plugins={[plugin.current]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {therapists.map((therapist) => {
                let heightClass = 'h-72';
                if (therapist.size === 'tall') {
                  heightClass = 'h-80 sm:h-96';
                } else if (therapist.size === 'medium') {
                  heightClass = 'h-72 sm:h-80';
                } else if (therapist.size === 'wide') {
                  heightClass = 'h-64 sm:h-72';
                }

                return (
                  <CarouselItem
                    key={therapist.id}
                    className={`pl-4 ${sizeClassMap[therapist.size]}`}
                  >
                    <div className={`group relative overflow-hidden rounded-xl bg-gray-900 ${heightClass}`}>
                      <Image
                        src={therapist.image}
                        alt={therapist.name}
                        width={therapist.width}
                        height={therapist.height}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="text-sm sm:text-base font-semibold leading-tight">{therapist.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-200 mt-1 line-clamp-2">{therapist.description}</p>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden" />
            <CarouselNext className="hidden" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}