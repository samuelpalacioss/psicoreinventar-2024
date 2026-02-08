import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Calendar, CheckCircle2, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import TherapistCardActions from "./therapist-card-actions";
import { Icons } from "./icons";
import Link from "next/link";

export interface TherapistCardProps {
  id: number;
  name: string;
  credentials?: string;
  image?: string;
  category: string;
  description: string;
  specialties: string[];
  yearsInPractice: number;
  averageRating?: number;
  totalRatings?: number;
  isVirtual?: boolean;
  className?: string;
}

export default function TherapistCard({
  id,
  name,
  credentials,
  image,
  category,
  description,
  specialties,
  yearsInPractice,
  averageRating = 0,
  totalRatings = 0,
  isVirtual = true,
  className,
}: TherapistCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("");

  // Display first 3 specialties prominently, show remaining count
  const displayedSpecialties = specialties.slice(0, 3);
  const remainingCount = specialties.length - displayedSpecialties.length;

  // Check if description is long enough to warrant a "Read more" link
  // Using a character threshold as a proxy for content length
  const shouldShowReadMore = description.length > 200;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6 space-y-6">
        {/* Main info section with avatar */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-16">
          <div className="shrink-0 md:w-48 flex flex-col items-center">
            <Avatar className="w-48 h-48">
              <AvatarImage src={image} alt={name} />
              <AvatarFallback className="text-3xl bg-gray-200 text-gray-600">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="mt-4 flex items-center gap-1.5">
              <Icons.star className="w-5 h-5 text-gray-700 fill-gray-700" />
              <span className="text-md font-medium text-gray-700">
                {averageRating > 0 ? `${averageRating.toFixed(1)} (${totalRatings})` : "No reviews"}
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-5">
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
                {name}
                {credentials && `, ${credentials}`}
              </h2>
              <Badge className="bg-indigo-200/40 text-indigo-600 hover:bg-indigo-200/40">
                {category}
              </Badge>
            </div>

            <div>
              <p className={cn(
                "text-[15px] sm:text-base leading-relaxed text-gray-600 max-w-[780px]",
                shouldShowReadMore && "line-clamp-3"
              )}>
                {description}
              </p>
              {shouldShowReadMore && (
                <Button variant="link" className="p-0 h-auto text-indigo-600 hover:text-indigo-700" asChild>
                  <Link href="/therapist-demo">Read more</Link>
                </Button>
              )}
            </div>

            <div>
              <p className="text-gray-900 font-medium text-base mb-3">Specialties</p>
              <div className="flex flex-wrap gap-2">
                {displayedSpecialties.map((specialty, index) => (
                  <Badge
                    key={specialty}
                    className="font-normal bg-stone-100 text-gray-600 text-sm py-1 px-2.5 hover:bg-stone-100 border-0"
                  >
                    {index === 0 && <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-gray-600" />}
                    {specialty}
                  </Badge>
                ))}
                {remainingCount > 0 && (
                  <Badge className="bg-stone-100 font-normal text-gray-600 text-sm py-1 px-2.5 hover:bg-stone-100 border-0">
                    +{remainingCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Availability and actions section */}
        <div className="md:pl-64 space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {isVirtual && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Video className="w-4 h-4 text-gray-500" />
                  <span>Virtual</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{yearsInPractice} years in practice</span>
              </div>
            </div>
          </div>

          <TherapistCardActions therapistId={id} therapistName={name} />
        </div>
      </CardContent>
    </Card>
  );
}
