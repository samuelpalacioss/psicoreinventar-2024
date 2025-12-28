"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface BenefitComparisonRowProps {
  title: string;
  description: string;
}

export function BenefitComparisonRow({
  title,
  description,
}: BenefitComparisonRowProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] gap-3 sm:gap-8 py-4 sm:py-5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="text-sm sm:text-base text-gray-900">{title}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
                aria-label="More information"
              >
                <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">{description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="w-16 sm:w-24 flex items-center justify-center">
        <div className="bg-indigo-100 rounded-full p-1.5 sm:p-2">
          <svg
            className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>
      <div className="w-16 sm:w-24 flex items-center justify-center">
        <div className="bg-gray-100 rounded-full p-1.5 sm:p-2 opacity-60">
          <svg
            className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

