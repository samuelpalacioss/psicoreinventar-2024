"use client";

import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";

interface TherapistCardActionsProps {
  therapistId: number;
  therapistName: string;
}

export default function TherapistCardActions({
  therapistId,
  therapistName,
}: TherapistCardActionsProps) {

  return (
    <div className="flex gap-3 pt-2">
      <Link
        onClick={() => console.log('Viewing profile of therapist: ', therapistName)}
        href={`/therapist/${therapistId}`}
        className={buttonVariants({
          variant: "outline",
          className: "flex-1 md:flex-initial h-11 md:h-10 px-7 py-3"
        })}
      >
        View profile
      </Link>
      <Link
        href={`/therapist/${therapistId}/book-session`}
        onClick={() => console.log('Booking session with therapist: ', therapistName)}
        className={buttonVariants({
          variant: "default",
          className: "bg-indigo-600! hover:bg-indigo-700! text-white! flex-1 md:flex-initial h-11 md:h-10 px-7 py-3",
        })}
      >
        Book session
      </Link>
    </div>
  );
}
