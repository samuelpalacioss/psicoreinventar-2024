"use client";

import * as React from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";

interface TherapistCard {
  id: string;
  name: string;
  title: string;
  image: string;
  description: string;
  width: number;
  height: number;
  size: "small" | "medium" | "tall" | "wide"; // Controls the item's visual size
  imageOffset?: "none" | "sm" | "md" | "lg" | "xl"; // Controls vertical offset for staggered layout
}

interface TherapistsCarouselProps {
  therapists?: TherapistCard[];
}

const DEFAULT_THERAPISTS: TherapistCard[] = [
  {
    id: "1",
    name: "LMFT",
    title: "LMFT",
    image: "https://via.placeholder.com/486x324/4f46e5/ffffff?text=Therapist+1",
    description: "It seems and interactive. I believe in work with clients, respectfully, and.",
    width: 486,
    height: 324,
    size: "medium",
    imageOffset: "sm",
  },
  {
    id: "2",
    name: "Evan Dunn, LCSW",
    title: "LCSW",
    image: "https://via.placeholder.com/384x532/4f46e5/ffffff?text=Evan+Dunn",
    description:
      "Evan specializes in working with individuals navigating life transitions and building resilience to reach breakthrough moments and goals.",
    width: 384,
    height: 532,
    size: "tall",
    imageOffset: "lg",
  },
  {
    id: "3",
    name: "Hany Urdaneta, LMHC",
    title: "LMHC",
    image: "https://via.placeholder.com/384x532/4f46e5/ffffff?text=Hany+Urdaneta",
    description:
      "My biggest strengths are listening, and judging, offering healing resources of the bar.",
    width: 384,
    height: 532,
    size: "tall",
    imageOffset: "none",
  },
  {
    id: "4",
    name: "Belinda Valdvia, LCSW",
    title: "LCSW",
    image: "https://via.placeholder.com/486x324/4f46e5/ffffff?text=Belinda",
    description:
      "My biggest strength is being positive and resilient, offering therapy to make you heal.",
    width: 486,
    height: 324,
    size: "medium",
    imageOffset: "xl",
  },
  {
    id: "5",
    name: "Stacy Thiry, LMFT",
    title: "LMFT",
    image: "https://via.placeholder.com/486x324/4f46e5/ffffff?text=Stacy+Thiry",
    description: "My goal is to help people become the best version of themselves.",
    width: 486,
    height: 324,
    size: "medium",
    imageOffset: "sm",
  },
  {
    id: "6",
    name: "Sarah Johnson, LCSW",
    title: "LCSW",
    image: "https://via.placeholder.com/384x532/4f46e5/ffffff?text=Sarah+Johnson",
    description: "Specializing in anxiety and depression treatment with evidence-based approaches.",
    width: 384,
    height: 532,
    size: "tall",
    imageOffset: "md",
  },
  {
    id: "7",
    name: "Marcus Williams, LMFT",
    title: "LMFT",
    image: "https://via.placeholder.com/486x324/4f46e5/ffffff?text=Marcus+Williams",
    description: "Expert in couples therapy and relationship counseling for all life stages.",
    width: 486,
    height: 324,
    size: "medium",
    imageOffset: "none",
  },
  {
    id: "8",
    name: "Jennifer Lee, LMHC",
    title: "LMHC",
    image: "https://via.placeholder.com/384x532/4f46e5/ffffff?text=Jennifer+Lee",
    description: "Passionate about trauma-informed care and resilience building.",
    width: 384,
    height: 532,
    size: "tall",
    imageOffset: "md",
  },
];

// Size mapping for carousel items - width and height at different breakpoints
const SIZE_CONFIG = {
  small: {
    width: "basis-36 sm:basis-40 md:basis-44",
    height: "h-72 sm:h-80 md:h-88",
  },
  medium: {
    // 486px × 324px at md breakpoint
    width: "basis-[340px] sm:basis-[413px] md:basis-[486px]",
    height: "h-[227px] sm:h-[275px] md:h-[324px]",
  },
  tall: {
    // 384px × 532px at md breakpoint
    width: "basis-[269px] sm:basis-[326px] md:basis-[384px]",
    height: "h-[372px] sm:h-[452px] md:h-[532px]",
  },
  wide: {
    width: "basis-56 sm:basis-64 md:basis-72",
    height: "h-64 sm:h-72 md:h-80",
  },
} as const;

// Offset mapping for vertical positioning - creates staggered layout
const OFFSET_CONFIG = {
  none: "mt-0",
  sm: "mt-8 sm:mt-12 md:mt-16",
  md: "mt-16 sm:mt-20 md:mt-24",
  lg: "mt-24 sm:mt-28 md:mt-32",
  xl: "mt-32 sm:mt-36 md:mt-40",
} as const;

const getSizeClasses = (
  size: "small" | "medium" | "tall" | "wide",
  offset?: "none" | "sm" | "md" | "lg" | "xl"
) => {
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.small;
  const offsetClass = OFFSET_CONFIG[offset || "none"];
  return {
    item: `flex-[0_0_auto] min-w-0 ${config.width} ${offsetClass}`,
    container: `w-full ${config.height}`,
  };
};

export function TherapistsCarousel({ therapists = DEFAULT_THERAPISTS }: TherapistsCarouselProps) {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      dragFree: true,
      watchDrag: false,
      watchSlides: false,
    },
    [
      AutoScroll({
        speed: 1,
        stopOnInteraction: false,
        stopOnMouseEnter: false,
        stopOnFocusIn: false,
        playOnInit: true,
      })
    ]
  );

  return (
    <div className="w-full overflow-hidden" ref={emblaRef}>
      <div className="flex touch-pan-y -ml-4">
        {therapists.map((therapist, index) => {
          const sizeClasses = getSizeClasses(therapist.size, therapist.imageOffset);

          return (
            <div
              key={`${therapist.id}-${index}`}
              className={sizeClasses.item}
              style={{ transform: 'translate3d(0, 0, 0)' }}
            >
              <div className="pl-4">
                <div
                  className={`group relative overflow-hidden rounded-xl bg-gray-900 ${sizeClasses.container}`}
                >
                  <Image
                    src={therapist.image}
                    alt={therapist.name}
                    width={therapist.width}
                    height={therapist.height}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-sm sm:text-base font-semibold leading-tight">
                      {therapist.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-200 mt-1 line-clamp-2">
                      {therapist.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
