"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar, Video, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { Icons } from "./icons";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import SimpleNav from "./simple-nav";
import Container from "./container";
import ReviewCard, { ReviewCardProps } from "./review-card";

// Extended interface based on TherapistCardProps
export interface TherapistDetailProps {
  // Base fields from TherapistCardProps
  id: number;
  name: string;
  credentials?: string;
  image?: string;
  description: string;
  specialties: string[];
  yearsInPractice: number;
  averageRating?: number;
  totalRatings?: number;
  isVirtual?: boolean;

  // Extended fields for detail page
  aboutMe: string;
  sessionPrice?: number;
  getToKnowMe: {
    firstSession: string;
    strengths: string;
  };
  otherSpecialties: string[];
  identities: string[];
  agesServed: string[];
  treatmentMethods: { name: string; description: string }[];
  licensedIn: string[];
  accepts: string[];
  availableSlots: { date: string; times: string[] }[];
  nextAvailable?: string;
  personalityTraits?: string[]; // e.g., "Intelligent", "Solution oriented", "Warm"
  reviews?: ReviewCardProps[];
  className?: string;
}

export default function TherapistDetail({
  id,
  name,
  credentials,
  image,
  description,
  specialties = [],
  yearsInPractice,
  averageRating = 0,
  totalRatings = 0,
  isVirtual = true,
  aboutMe = "",
  sessionPrice,
  getToKnowMe = { firstSession: "", strengths: "" },
  otherSpecialties = [],
  identities = [],
  agesServed = [],
  treatmentMethods = [],
  licensedIn = [],
  accepts = [],
  availableSlots = [],
  nextAvailable,
  personalityTraits = [],
  reviews = [],
  className,
}: TherapistDetailProps) {
  const [selectedInsurance, setSelectedInsurance] = useState("cash");
  const [selectedDate, setSelectedDate] = useState(0);
  const [showAllLicenses, setShowAllLicenses] = useState(false);
  const [showAllInsurances, setShowAllInsurances] = useState(false);
  const [isAvatarExpanded, setIsAvatarExpanded] = useState(false);
  const [isSpecialtiesModalOpen, setIsSpecialtiesModalOpen] = useState(false);

  const initials = name
    ? name
        .split(" ")
        .map((n) => n.charAt(0))
        .join("")
    : "";

  // Determine how many licenses to show
  const displayedLicenses = showAllLicenses ? licensedIn : licensedIn.slice(0, 1);
  const remainingLicenses = licensedIn.length - 1;

  // Determine how many insurances to show
  const displayedInsurances = showAllInsurances ? accepts : accepts.slice(0, 6);
  const remainingInsurances = accepts.length - 6;

  return (
    <div className={cn(className)}>
      {/* Top info bar - Licensed to practice, Specializes in */}
      <section className="py-6">
        <Container>
          <div className="mb-6 pb-4 border-b flex flex-wrap gap-4 text-sm text-gray-700">
            <div className="flex items-center flex-wrap gap-1 text-xs sm:text-sm">
              <span className="text-gray-600">Specializes in</span>{" "}
              {specialties.slice(0, 3).map((specialty) => (
                <Badge
                  key={specialty}
                  className="bg-stone-200 text-gray-700 text-xs sm:text-sm hover:bg-stone-100 mx-1 font-normal px-2.5 py-1 sm:px-3 sm:py-1.5"
                >
                  {specialty}
                </Badge>
              ))}
              {specialties.length > 3 && (
                <button
                  onClick={() => setIsSpecialtiesModalOpen(true)}
                  className="text-gray-600 ml-1 hover:text-indigo-600 font-medium underline cursor-pointer"
                >
                  +{specialties.length - 3}
                </button>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Hero Section - Full Width */}
      <section>
        <Container>
          <div className="space-y-8 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative">
              {/* Book Session CTA - Top Right */}
              <div className="absolute top-0 right-0 hidden lg:block">
                <Button className="cursor-pointer bg-indigo-600! hover:bg-indigo-700! text-white! h-10 px-7 py-3">
                  Book session
                </Button>
              </div>

              <div className="shrink-0 relative flex flex-col items-center sm:items-start">
                <Avatar
                  className={cn(
                    "cursor-pointer transition-all duration-300 ease-in-out",
                    isAvatarExpanded
                      ? "w-[166px] h-[166px] sm:w-[208px] sm:h-[208px]"
                      : "w-36 h-36 sm:w-40 sm:h-40"
                  )}
                  onClick={() => setIsAvatarExpanded(!isAvatarExpanded)}
                >
                  <AvatarImage src={image} alt={name} />
                  <AvatarFallback className="text-3xl bg-gray-200 text-gray-600">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {averageRating > 0 && (
                  <div className="mt-3 flex items-center gap-1.5">
                    <Icons.star className="w-4 h-4 text-gray-700 fill-gray-700" />
                    <span className="text-base font-medium text-gray-700">
                      {averageRating.toFixed(1)} ({totalRatings})
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-4xl font-semibold text-gray-900 mb-2">{name}</h1>
                  <p className="text-base sm:text-lg text-gray-600 mb-3">
                    {credentials}, {yearsInPractice} years of experience
                  </p>
                  {sessionPrice && (
                    <Badge className="bg-white mb-3 text-gray-600 border border-gray-300 hover:bg-white font-normal text-sm px-3 py-1.5">
                      ${sessionPrice}/session
                    </Badge>
                  )}
                  {personalityTraits && personalityTraits.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 justify-center sm:justify-start">
                      {personalityTraits.map((trait) => (
                        <Badge
                          key={trait}
                          className="bg-white text-gray-600 border border-gray-300 hover:bg-white font-normal text-sm px-3 py-1.5"
                        >
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 text-sm text-gray-700 items-center sm:items-start">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {isVirtual && (
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-gray-600" />
                        <span>Virtual</span>
                      </div>
                    )}
                    {nextAvailable && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <span>Next available on {nextAvailable}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Overview Tab */}
            <div className="relative">
              <div className="inline-block py-3 pr-3 text-gray-900 font-medium relative z-10 border-b-3 border-indigo-600">
                Overview
              </div>
              <div className="-mx-6 lg:mx-0 absolute bottom-0 left-0 right-0">
                <Separator />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Content Grid with Sidebar */}
      <section className="pb-28 lg:pb-0">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Me */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">About me</h2>
                <p className="text-base leading-relaxed text-gray-600 whitespace-pre-line">
                  {aboutMe}
                </p>
              </section>

              {/* Get to Know Me */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get to know me</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium text-gray-800 mb-2">
                      In our first session together, here&apos;s what you can expect
                    </h3>
                    <p className="text-base leading-relaxed text-gray-600">
                      {getToKnowMe.firstSession}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base font-medium text-gray-800 mb-2">
                      The biggest strengths that I bring into our sessions
                    </h3>
                    <p className="text-base leading-relaxed text-gray-600">
                      {getToKnowMe.strengths}
                    </p>
                  </div>
                </div>
              </section>

              <div className="-mx-6 lg:mx-0">
                <Separator />
              </div>

              {/* Specialties */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Specialties</h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Top specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {specialties.slice(0, 3).map((specialty, index) => (
                        <Badge
                          key={specialty}
                          className="bg-stone-100 text-gray-700 hover:bg-stone-100 font-normal text-sm py-1.5 px-3"
                        >
                          {index === 0 && <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                          <Icons.star className="w-3.5 h-3.5 mr-1.5 fill-gray-700" />
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {otherSpecialties.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Other specialties</h3>
                      <div className="flex flex-wrap gap-2">
                        {otherSpecialties.map((specialty) => (
                          <Badge
                            key={specialty}
                            className="bg-stone-100 text-gray-700 hover:bg-stone-100 font-normal text-sm py-1.5 px-3"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <div className="-mx-6 lg:mx-0">
                <Separator />
              </div>

              {/* Serves Ages */}
              {agesServed.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Serves ages</h2>
                  <div className="flex flex-wrap gap-2">
                    {agesServed.map((age) => (
                      <Badge
                        key={age}
                        className="bg-stone-100 text-gray-700 hover:bg-stone-100 font-normal text-sm py-1.5 px-3"
                      >
                        {age}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              <div className="-mx-6 lg:mx-0">
                <Separator />
              </div>

              {/* Treatment Methods */}
              {treatmentMethods.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    My treatment methods
                  </h2>
                  <div className="space-y-4">
                    {treatmentMethods.map((method) => (
                      <div key={method.name}>
                        <h3 className="text-base font-medium text-gray-800 mb-2">{method.name}</h3>
                        <p className="text-base leading-relaxed text-gray-600">
                          {method.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <div className="-mx-6 lg:mx-0">
                <Separator />
              </div>

              {/* Location */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Location</h2>
                {isVirtual && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Video className="w-4 h-4" />
                    <span>Virtual</span>
                  </div>
                )}
              </section>

              <div className="-mx-6 lg:mx-0">
                <Separator />
              </div>

              {/* Licensed In */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Licensed in</h2>
                <div className="flex flex-wrap gap-2 items-center">
                  {displayedLicenses.map((state) => (
                    <Badge
                      key={state}
                      className="bg-stone-100 text-gray-700 hover:bg-stone-100 font-normal text-sm py-1.5 px-3"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      {state}
                    </Badge>
                  ))}
                  {remainingLicenses > 0 && !showAllLicenses && (
                    <button
                      onClick={() => setShowAllLicenses(true)}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                    >
                      Show {remainingLicenses} more
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  )}
                  {showAllLicenses && remainingLicenses > 0 && (
                    <button
                      onClick={() => setShowAllLicenses(false)}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                    >
                      Show less
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </section>

              <div className="-mx-6 lg:mx-0">
                <Separator />
              </div>

              {/* Accepts */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Accepts</h2>
                <div className="flex flex-wrap gap-2 items-center">
                  {displayedInsurances.map((insurance) => (
                    <Badge
                      key={insurance}
                      className="bg-stone-100 text-gray-700 hover:bg-stone-100 font-normal text-sm py-1.5 px-3"
                    >
                      {insurance}
                    </Badge>
                  ))}
                  {remainingInsurances > 0 && !showAllInsurances && (
                    <button
                      onClick={() => setShowAllInsurances(true)}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                    >
                      Show more
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  )}
                  {showAllInsurances && remainingInsurances > 0 && (
                    <button
                      onClick={() => setShowAllInsurances(false)}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                    >
                      Show less
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </section>

              <div className="-mx-6 lg:mx-0">
                <Separator />
              </div>

              {/* Rating */}
              <section>
                <div className="flex items-center gap-3 mb-3">
                  <Icons.star className="w-8 h-8 text-gray-700 fill-gray-700" />
                  <div>
                    <span className="text-3xl font-semibold text-gray-900">
                      {averageRating.toFixed(1)}
                    </span>
                    <span className="text-xl text-gray-600"> ({totalRatings})</span>
                  </div>
                </div>

                <a
                  href="#"
                  className="text-sm text-gray-600 underline hover:text-gray-800 inline-block mb-6"
                >
                  Learn how ratings and reviews work
                </a>

                {totalRatings === 0 ? (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">
                      This provider hasn&apos;t received any written reviews yet. We started
                      collecting written reviews January 1, 2025.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      {totalRatings} rating{totalRatings !== 1 ? "s" : ""} with written reviews
                    </h3>

                    {reviews.length > 0 ? (
                      <div>
                        {reviews.map((review, index) => (
                          <ReviewCard
                            key={index}
                            {...review}
                            therapistName={name}
                            showSeparator={index < reviews.length - 1}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="py-6">
                        <p className="text-sm text-gray-600">No reviews available yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>

            {/* Sticky Booking Sidebar - Hidden on mobile */}
            <div className="lg:col-span-1 hidden lg:block">
              <Card className="sticky top-6">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-baseline justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Book session</h3>
                    <span className="text-sm text-gray-600">GMT-4 Timezone</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Insurance name
                    </label>
                    <Select value={selectedInsurance} onValueChange={setSelectedInsurance}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select insurance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        {accepts.map((insurance) => (
                          <SelectItem
                            key={insurance}
                            value={insurance.toLowerCase().replace(/\s+/g, "-")}
                          >
                            {insurance}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Select a virtual session:
                    </label>

                    {/* Date Selector */}
                    <div className="space-y-3">
                      {availableSlots.map((slot, index) => (
                        <div key={slot.date}>
                          <button
                            onClick={() => setSelectedDate(selectedDate === index ? -1 : index)}
                            className="text-sm font-medium text-gray-700 mb-2 block w-full text-left hover:text-gray-900"
                          >
                            {slot.date}
                          </button>

                          {selectedDate === index && (
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              {slot.times.map((time) => (
                                <Button
                                  key={time}
                                  variant="outline"
                                  size="sm"
                                  className="text-sm font-normal"
                                >
                                  {time}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="cursor-pointer w-full bg-indigo-600! hover:bg-indigo-700! text-white! h-11 px-7 py-3">
                    Book session
                  </Button>

                  <button className="cursor-pointer w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium text-center">
                    See more availabilities
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Mobile Sticky Footer - Only visible on mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-gray-400 bg-white px-4 py-6 z-50">
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-full text-base">
          Book session
        </Button>
      </div>

      {/* About Therapist Modal */}
      <Dialog open={isSpecialtiesModalOpen} onOpenChange={setIsSpecialtiesModalOpen}>
        <DialogContent
          showCloseButton={false}
          className="w-[calc(100%-2rem)] max-w-2xl sm:max-w-3xl max-h-[80vh] overflow-y-auto p-0"
        >
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl sm:text-2xl font-semibold text-gray-900">
                About {name}
              </DialogTitle>
              <button
                onClick={() => setIsSpecialtiesModalOpen(false)}
                className="rounded-md p-2 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="cursor-pointer h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>

          <Separator />

          {/* Licensed In Section */}
          {licensedIn.length > 0 && (
            <div className="px-6 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Licensed in</h3>
              <div className="flex flex-wrap gap-2">
                {licensedIn.map((state) => (
                  <Badge
                    key={state}
                    className="bg-stone-100 text-gray-700 hover:bg-stone-100 font-normal text-sm py-2 px-3"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    {state}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Serves Ages Section */}
          {agesServed.length > 0 && (
            <div className="px-6 py-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Serves ages</h3>
              <div className="flex flex-wrap gap-2">
                {agesServed.map((age) => (
                  <Badge
                    key={age}
                    className="bg-stone-100 text-gray-700 hover:bg-stone-100 font-normal text-sm py-2 px-3"
                  >
                    {age}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Specialties Section */}
          <div className="px-6 py-2 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty) => (
                <Badge
                  key={specialty}
                  className="bg-stone-100 text-gray-700 hover:bg-stone-100 font-normal text-sm py-2 px-3"
                >
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sample data for testing
export const sampleTherapistDetail: TherapistDetailProps = {
  id: 1,
  name: "Laura Savage",
  credentials: "LCSW",
  image: "/placeholder-therapist.jpg",
  description:
    "I work with adolescents, adults, and families, treating childhood trauma, family-related issues, depression, anxiety, and low self-esteem.",
  specialties: [
    "ADHD",
    "Anxiety",
    "Peer Relationships",
    "Spirituality",
    "Trauma and PTSD",
    "Women's Issues",
    "Relationship Issues",
    "Grief and Loss",
    "Parenting",
    "Stress Management",
    "Self Esteem",
    "Depression",
    "Family Therapy",
    "Individual Therapy",
    "Couple Therapy",
    "Teen Therapy",
    "Adult Therapy",
    "Child Therapy",
    "Adolescent Therapy",
    "Family Therapy",
    "Individual Therapy",
    "Couple Therapy",
    "Teen Therapy",
    "Adult Therapy",
  ],
  yearsInPractice: 25,
  averageRating: 5.0,
  totalRatings: 3,
  isVirtual: true,
  sessionPrice: 100,
  nextAvailable: "Tue, Nov 25",
  personalityTraits: ["Intelligent", "Solution oriented", "Warm"],
  aboutMe: `Hello, my name is Laura Savage, and I have had the privilege of working as a Social Worker since 1997. I earned my undergraduate degree from the University of Delaware and later obtained a Master's in Social Work from Florida International University.

Throughout my career, I have had the opportunity to work with diverse populations across a range of settings, including an adolescent residential treatment facility, a hospital, and a nonprofit organization supporting children affected by cancer and their families. Currently, I am employed within a school district, where I provide school-based counseling services to middle and high school students.`,
  getToKnowMe: {
    firstSession: `The initial session will focus on establishing a strong therapeutic relationship; I want you to feel comfortable, seen, and valued. I also want to get to know your story and hear what brought you to therapy. I encourage clients to prioritize what they would like to work on first. We establish therapeutic goals together early on in the treatment process. As we continue to work together, we reflect on those goals to maximize the client's experience, track progress and growth, and adjust goals as needed.`,
    strengths: `I approach my work with clients through a lens of understanding and compassion; there is no judgment or shame in our shared space, and my clients feel heard, seen, and valued. I am here to act as a trusting guide to help you navigate whatever murky waters you are experiencing. In our work together, I will hold space for you and challenge you. I aim to find the balance between cheering you on from the sidelines and coaching you to reach your goals. Clients have described me as warm, empathetic, and someone willing to invest the effort needed to make meaningful change. They understand that transformation happens through consistent, small steps and are dedicated to doing the work to get there.`,
  },
  otherSpecialties: ["Spirituality", "Trauma and PTSD", "Women's Issues"],
  identities: ["Jewish", "Woman"],
  agesServed: ["Adults (18 to 64)", "Teenagers (13 to 17)"],
  treatmentMethods: [
    {
      name: "Attachment-based",
      description: `Attachment-based therapy is a form of psychotherapy that helps individuals build healthier, more secure relationships. I work with clients to recognize their relationship patterns and develop new ways of fostering strong emotional connections.`,
    },
    {
      name: "Cognitive Behavioral Therapy (CBT)",
      description: `CBT is a structured, goal-oriented approach that helps identify and change negative thought patterns and behaviors. Through practical techniques, clients learn to reframe unhelpful thinking and develop healthier coping mechanisms that enable them to lead positive and productive lives.`,
    },
  ],
  licensedIn: ["New York", "New Jersey"],
  accepts: [
    "Cash - $150 per session",
    "Cigna",
    "EAP-Cigna",
    "EAP-Evernorth",
    "Evernorth",
    "GTEB",
    "Tufts Health/Cigna",
    "Aetna",
    "Blue Cross Blue Shield",
    "United Healthcare",
  ],
  availableSlots: [
    {
      date: "lun, nov. 24",
      times: [
        "8:00 a. m.",
        "8:30 a. m.",
        "9:00 a. m.",
        "9:30 a. m.",
        "10:00 a. m.",
        "10:30 a. m.",
        "11:00 a. m.",
        "3:00 p. m.",
        "3:30 p. m.",
        "4:00 p. m.",
      ],
    },
    {
      date: "mar, nov. 25",
      times: ["6:00 p. m.", "7:00 p. m."],
    },
    {
      date: "mie, nov. 26",
      times: ["8:00 a. m.", "9:00 a. m.", "10:00 a. m.", "11:00 a. m.", "3:00 p. m.", "4:00 p. m."],
    },
  ],
  reviews: [
    {
      clientInfo: "Verified client, age 45-54",
      sessionNumber: 26,
      therapistName: "Laura Savage",
      rating: 5,
      date: "April 2, 2025",
      content:
        "Laura has been incredibly supportive and understanding. Her approach to therapy is warm and professional. I've made significant progress in just a few months. She really listens and helps me see things from different perspectives.",
    },
    {
      clientInfo: "Verified client, age 35-44",
      sessionNumber: 12,
      therapistName: "Laura Savage",
      rating: 5,
      date: "March 18, 2025",
      content:
        "I appreciate how Laura creates a safe space for me to express myself. Her expertise in trauma work has been invaluable. She's patient, empathetic, and always well-prepared for our sessions.",
    },
    {
      clientInfo: "Verified client, age 25-34",
      sessionNumber: 8,
      therapistName: "Laura Savage",
      rating: 4,
      date: "March 5, 2025",
      content:
        "Good experience overall. Laura is knowledgeable and caring. Sometimes I wish the sessions were a bit longer, but the quality of care is excellent.",
    },
  ],
};
