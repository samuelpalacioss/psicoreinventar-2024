"use client";

import { cn } from "@/lib/utils";
import { ChevronDownIcon, MagnifyingGlassIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";

interface FilterOption {
  label: string;
  value: string;
}

interface SearchTherapistsBarProps {
  className?: string;
}

export default function SearchTherapistsBar({ className }: SearchTherapistsBarProps) {
  const [location, setLocation] = useState<string>("Alaska");
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [sessionType, setSessionType] = useState<string>("Virtual");
  const [therapyType, setTherapyType] = useState<string>("Talk therapy");
  const [specialty, setSpecialty] = useState<string>("ADHD");
  const [treatmentMethod, setTreatmentMethod] = useState<string>("Treatment methods");
  const [moreFiltersCount] = useState<number>(4);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <div className={cn("border-b bg-cream", className)}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Logo Section */}
        <div className="flex items-center mb-6">
          <Link
            href="/"
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
              className="bg-linear-to-r from-indigo-700 via-indigo-600 to-indigo-400 bg-clip-text text-transparent"
              style={{
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "inline-block",
              }}
            >
              Psicoreinventar
            </span>
          </Link>

          <div className="ml-auto flex items-center h-10">
            {isSearchOpen ? (
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => {
                    if (!searchQuery) setIsSearchOpen(false);
                  }}
                  className="pl-10 pr-4 h-10 text-sm border-2 border-indigo-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
                  autoFocus
                />
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-gray-300 transition-colors hover:bg-gray-100"
              >
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Therapists in</span>

          <FilterDropdown value={location} onChange={setLocation}>
            {location}
          </FilterDropdown>

          <span className="text-sm font-medium text-gray-700">accepting</span>

          <FilterDropdown value={paymentMethod} onChange={setPaymentMethod}>
            {paymentMethod}
          </FilterDropdown>

          <FilterDropdown value={sessionType} onChange={setSessionType}>
            {sessionType}
          </FilterDropdown>

          <FilterDropdown value={therapyType} onChange={setTherapyType}>
            {therapyType}
          </FilterDropdown>

          <FilterDropdown value={specialty} onChange={setSpecialty}>
            {specialty}
          </FilterDropdown>

          <FilterDropdown value={treatmentMethod} onChange={setTreatmentMethod}>
            {treatmentMethod}
          </FilterDropdown>

          <Button
            variant="outline"
            className="rounded-full border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            More filters ({moreFiltersCount})
          </Button>
        </div>
      </div>
    </div>
  );
}

interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

function FilterDropdown({ value, onChange, children }: FilterDropdownProps) {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
    >
      {children}
      <ChevronDownIcon className="h-4 w-4 text-gray-500" />
    </button>
  );
}
