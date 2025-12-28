"use client";

import Container from "./container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";

interface ServiceHeroProps {
  headline: string;
  subheadline: string;
  image: string;
  primaryCTA: { text: string; href: string };
  secondaryCTA: { text: string; href: string };
}

export function ServiceHero({ headline, subheadline, image, primaryCTA, secondaryCTA }: ServiceHeroProps) {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden">
      {/* Organic background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-normal text-gray-900 leading-tight">
              {headline}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
              {subheadline}
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                href={primaryCTA.href}
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-4 rounded-lg font-medium"
                )}
              >
                {primaryCTA.text}
              </Link>
              <Link
                href={secondaryCTA.href}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "px-8 py-4 rounded-lg font-medium"
                )}
              >
                {secondaryCTA.text}
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="hidden lg:block absolute -top-4 -left-4 w-24 h-24 bg-indigo-100 rounded-3xl opacity-70 rotate-12"></div>
            <div className="hidden lg:block absolute -bottom-4 -right-4 w-32 h-32 bg-purple-100 rounded-3xl opacity-70 -rotate-12"></div>
            <Image
              src={image}
              alt={headline}
              width={600}
              height={600}
              className="relative w-full rounded-xl shadow-sm object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

interface ServiceSectionProps {
  children: ReactNode;
  className?: string;
  background?: "white" | "gray";
}

export function ServiceSection({ children, className, background = "white" }: ServiceSectionProps) {
  const bgClass = background === "gray" ? "bg-gray-50/50" : "bg-white";

  return (
    <section className={cn("py-16 sm:py-24", bgClass, className)}>
      <Container>{children}</Container>
    </section>
  );
}
