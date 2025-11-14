'use client';

import * as React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Image from 'next/image';

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
];

// Size mapping for basis widths to create varying carousel item widths
const sizeClassMap = {
  small: 'basis-36 sm:basis-40 md:basis-44',
  medium: 'basis-44 sm:basis-48 md:basis-56',
  tall: 'basis-40 sm:basis-44 md:basis-52',
  wide: 'basis-56 sm:basis-64 md:basis-72',
};

export function TherapistsCarousel({ therapists = DEFAULT_THERAPISTS }: TherapistsCarouselProps) {
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
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
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
                    className={`pl-2 md:pl-4 ${sizeClassMap[therapist.size]}`}
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
            <CarouselPrevious className="hidden md:flex -left-12 lg:-left-16 hover:bg-gray-200" />
            <CarouselNext className="hidden md:flex -right-12 lg:-right-16 hover:bg-gray-200" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}