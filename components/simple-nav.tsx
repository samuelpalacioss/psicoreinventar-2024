import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface SimpleNavProps {
  backHref: string;
  backLabel?: string;
}

export default function SimpleNav({ backHref, backLabel = "Go back" }: SimpleNavProps) {
  return (
    <div className="border-b bg-cream">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-3 sm:py-6">
        <div className="flex items-center">
          <Link
            href={backHref}
            aria-label={backLabel}
            className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>

          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight text-primary hover:text-primary/90 flex items-center gap-1 select-none absolute left-1/2 transform -translate-x-1/2"
            style={{
              fontFamily: "'Inter', 'sans-serif'",
              letterSpacing: "-0.04em",
              userSelect: "none",
            }}
            aria-label="Psicoreinventar Logo"
          >
            <span
              className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-400 bg-clip-text text-transparent"
              style={{
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "inline-block",
              }}
            >
              Psicoreinventar
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
