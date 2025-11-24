import { User } from "lucide-react";
import { Icons } from "./icons";
import { Separator } from "./ui/separator";
import { cn } from "@/lib/utils";

export interface ReviewCardProps {
  clientInfo: string; // e.g., "Verified client, age 45-54"
  sessionNumber: number;
  therapistName: string;
  rating: number; // 1-5
  date: string; // e.g., "April 2, 2025"
  content: string;
  showSeparator?: boolean;
}

export default function ReviewCard({
  clientInfo,
  sessionNumber,
  therapistName,
  rating,
  date,
  content,
  showSeparator = true,
}: ReviewCardProps) {
  return (
    <>
      <div className="py-6">
        {/* Header: User info and rating */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-base">{clientInfo}</p>
              <p className="text-sm text-gray-600 mt-0.5">
                Review shared after session {sessionNumber} with {therapistName}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Icons.star
                  key={star}
                  className={cn(
                    "w-5 h-5",
                    star <= rating
                      ? "text-gray-700 fill-gray-700"
                      : "text-gray-300 fill-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">{date}</span>
          </div>
        </div>

        {/* Review content */}
        <div className="pl-[52px]">
          <p className="text-base leading-relaxed text-gray-700">{content}</p>
        </div>
      </div>
      {showSeparator && <Separator />}
    </>
  );
}
