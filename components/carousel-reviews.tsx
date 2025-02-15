'use client';
import { useRef } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { marketingConfig } from '@/config/marketing';
import Image from 'next/image';
import { TestimonialItem } from '@/types';

interface ReviewsCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  items: TestimonialItem[];
}

export default function ReviewsCarousel({ items, className }: ReviewsCarouselProps) {
  const plugin = useRef(Autoplay({ delay: 8000, stopOnInteraction: true }));

  return (
    <Carousel
      plugins={[plugin.current]}
      className='w-full p-8 md:pb-16 lg:p-16 lg:pb-24 bg-indigo-100 shadow-lg rounded-lg'
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {items.map((item, index) => (
          <CarouselItem key={index}>
            <Card className='flex justify-between gap-4 bg-indigo-100 border-0 shadow-none'>
              <div className='flex items-center'>
                <div className='flex-1 md:max-w-md 2md:max-w-lg lg:max-w-3xl'>
                  <blockquote className='text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900'>
                    &quot;{item.body}&quot;
                  </blockquote>
                  <div className='flex items-center gap-4 mt-6'>
                    <Image
                      alt='Avatar of the testimonial author'
                      src={item.author.imageUrl}
                      className='md:hidden inline-flex items-center justify-center  rounded-full bg-gray-500'
                      height={48}
                      width={48}
                    />
                    <div className='testimonials-details space-y-1'>
                      <p className='text-lg font-semibold text-gray-900'>{item.author.name}</p>
                      <p className='text-base text-gray-600'>Patient</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='hidden md:block overflow-hidden md:relative w-48 h-48 lg:w-60 lg:h-60 aspect-square'>
                <Image
                  alt='Avatar of the testimonial author'
                  src={item.author.imageUrl}
                  className='object-cover items-center rounded-md'
                  fill
                  sizes='(min-width: 1320px) 240px, (min-width: 1080px) calc(14.55vw + 51px), calc(3.93vw + 161px)'
                ></Image>
              </div>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className='absolute right-8 bottom-4 flex gap-4 h-10'>
        <CarouselPrevious className='h-10 w-10' />
        <CarouselNext className='h-10 w-10' />
      </div>
    </Carousel>
  );
}
