"use client";

import { cn } from "@/lib/utils";
import { ChevronDownIcon, MagnifyingGlassIcon, ArrowLeftIcon, XMarkIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { MultiSelectDropdown } from "./multi-select-dropdown";
import Link from "next/link";

interface SearchTherapistsBarProps {
  className?: string;
}

export default function SearchTherapistsBar({ className }: SearchTherapistsBarProps) {
  const [location, setLocation] = useState<string>("Alaska");
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState<boolean>(false);
  const [isFindProviderModalOpen, setIsFindProviderModalOpen] = useState<boolean>(false);

  // Individual field modals
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isSpecialtiesModalOpen, setIsSpecialtiesModalOpen] = useState<boolean>(false);

  // Search states for each modal
  const [locationSearch, setLocationSearch] = useState<string>("");
  const [paymentSearch, setPaymentSearch] = useState<string>("");
  const [specialtiesSearch, setSpecialtiesSearch] = useState<string>("");

  // State for checkbox filters in modal
  const [selectedSessionType, setSelectedSessionType] = useState<string>("Virtual");
  const [selectedTherapyTypes, setSelectedTherapyTypes] = useState<string[]>(["Talk therapy"]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(["ADHD"]);
  const [tempSelectedSpecialties, setTempSelectedSpecialties] = useState<string[]>(["ADHD"]);
  const [selectedTreatmentMethods, setSelectedTreatmentMethods] = useState<string[]>([]);

  // Data lists
  const locations = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York, USA", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];
  const paymentMethods = ["Cash", "Zelle", "Bank transfer", "Pago Movil"];
  const specialtiesList = ["ADHD", "Anxiety", "Depression", "Trauma", "Stress", "Relationship issues", "Grief", "Coping Skills", "Addiction", "Bipolar Disorder", "Eating Disorders", "OCD", "PTSD", "Self Esteem"];

  const toggleCheckbox = (value: string, selectedValues: string[], setter: (values: string[]) => void) => {
    if (selectedValues.includes(value)) {
      setter(selectedValues.filter(v => v !== value));
    } else {
      setter([...selectedValues, value]);
    }
  };

  return (
    <div className={cn("border-b bg-cream", className)}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Logo Section */}
        <div className="mb-6">
          <div className="flex items-center">
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
              {/* Desktop search */}
              <div className="hidden md:flex">
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
                      className="bg-white pl-10 pr-4 h-10 text-sm border-2 border-indigo-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
                      autoFocus
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-gray-300 transition-colors hover:bg-gray-100"
                  >
                    <MagnifyingGlassIcon className="cursor-pointer h-5 w-5 text-gray-600" />
                  </button>
                )}
              </div>

              {/* Mobile search icon */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden flex h-10 w-10 items-center justify-center rounded-md border-2 border-gray-300 transition-colors hover:bg-gray-100"
              >
                <MagnifyingGlassIcon className="cursor-pointer h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Mobile search bar - full width below header */}
          {isSearchOpen && (
            <div className="md:hidden mt-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white pl-10 pr-10 h-10 text-sm border-2 border-indigo-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <XMarkIcon className="cursor-pointer h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filters Section */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mobile: Show current selections and "More" buttons */}
          <div className="flex gap-3 w-full md:hidden">
            <button
              onClick={() => setIsFindProviderModalOpen(true)}
              className="w-[60%] rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left truncate"
            >
              {location && paymentMethod ? (
                <span className="truncate">
                  {location.length > 8 ? `${location.substring(0, 8)}...` : location}
                  {' • '}
                  {paymentMethod.length > 5 ? `${paymentMethod.substring(0, 6)}...` : paymentMethod}
                  {selectedSpecialties.length > 0 && (
                    <> • Specialties ({selectedSpecialties.length})</>
                  )}
                </span>
              ) : (
                'Find a provider'
              )}
            </button>
            <Button
              onClick={() => setIsFiltersModalOpen(true)}
              variant="outline"
              className="flex-1 h-auto rounded-full border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <span>More</span>
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop: Show all filters inline */}
          <div className="hidden md:flex md:flex-wrap md:items-center md:gap-3">
            <span className="text-sm font-medium text-gray-700">Therapists in</span>

            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-auto h-9 rounded-full border-gray-300 bg-white px-4 text-sm focus:ring-0 focus:ring-offset-0 focus:outline-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className="max-h-[300px]"

              >
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-sm font-medium text-gray-700">accepting</span>

            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="w-auto h-9 rounded-full border-gray-300 bg-white px-4 text-sm focus:ring-0 focus:ring-offset-0 focus:outline-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <MultiSelectDropdown
              label={
                selectedSpecialties.length === 0
                  ? "Specialties"
                  : selectedSpecialties.length === 1
                  ? selectedSpecialties[0]
                  : `${selectedSpecialties[0]} +${selectedSpecialties.length - 1}`
              }
              options={specialtiesList}
              selectedValues={selectedSpecialties}
              onChange={setSelectedSpecialties}
            />

            <Select value={selectedSessionType} onValueChange={setSelectedSessionType}>
              <SelectTrigger className="w-auto h-9 rounded-full border-gray-300 bg-white px-4 text-sm focus:ring-0 focus:ring-offset-0 focus:outline-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Virtual", "In-person", "Virtual & In-person"].map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <MultiSelectDropdown
              label={
                selectedTherapyTypes.length === 0
                  ? "Therapy type"
                  : selectedTherapyTypes.length === 1
                  ? selectedTherapyTypes[0]
                  : `${selectedTherapyTypes[0]} +${selectedTherapyTypes.length - 1}`
              }
              options={["Talk therapy", "Couples therapy", "Teen therapy"]}
              selectedValues={selectedTherapyTypes}
              onChange={setSelectedTherapyTypes}
            />

            <MultiSelectDropdown
              label={
                selectedTreatmentMethods.length === 0
                  ? "Treatment method"
                  : selectedTreatmentMethods.length === 1
                  ? selectedTreatmentMethods[0]
                  : `${selectedTreatmentMethods[0]} +${selectedTreatmentMethods.length - 1}`
              }
              options={["CBT", "DBT", "EMDR", "Psychodynamic", "Mindfulness-based", "Solution-focused"]}
              selectedValues={selectedTreatmentMethods}
              onChange={setSelectedTreatmentMethods}
            />
          </div>
        </div>
      </div>

      {/* Mobile More Filters Modal */}
      <Dialog open={isFiltersModalOpen} onOpenChange={setIsFiltersModalOpen}>
        <DialogContent className="h-full max-h-screen w-full max-w-full rounded-none p-0 md:hidden data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3">
            <DialogTitle className="text-xl font-semibold">More filters</DialogTitle>
            <button
              onClick={() => setIsFiltersModalOpen(false)}
              className="rounded-md p-2 hover:bg-gray-100 transition-colors"
              aria-label="Close filters"
            >
              <XMarkIcon className="cursor-pointer h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1 px-4 py-6">
            {/* Session Type Section */}
            <div className="mb-8">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Session type</h3>
              <div className="space-y-3">
                {["Virtual", "In-person", "Virtual & In-person"].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-3 cursor-pointer py-2"
                  >
                    <Checkbox
                      checked={selectedSessionType === type}
                      onCheckedChange={() => setSelectedSessionType(type)}
                    />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Therapy Type Section */}
            <div className="mb-8">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Therapy type</h3>
              <div className="space-y-3">
                {["Talk therapy", "Couples therapy", "Teen therapy"].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-3 cursor-pointer py-2"
                  >
                    <Checkbox
                      checked={selectedTherapyTypes.includes(type)}
                      onCheckedChange={() => toggleCheckbox(type, selectedTherapyTypes, setSelectedTherapyTypes)}
                    />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Treatment Method Section */}
            <div className="mb-8">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Treatment method</h3>
              <div className="space-y-3">
                {["CBT", "DBT", "EMDR", "Psychodynamic", "Mindfulness-based", "Solution-focused"].map((method) => (
                  <label
                    key={method}
                    className="flex items-center gap-3 cursor-pointer py-2"
                  >
                    <Checkbox
                      checked={selectedTreatmentMethods.includes(method)}
                      onCheckedChange={() => toggleCheckbox(method, selectedTreatmentMethods, setSelectedTreatmentMethods)}
                    />
                    <span className="text-sm text-gray-700">{method}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer with action buttons */}
          <div className="sticky bottom-0 border-t bg-white px-4 py-6 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 py-6"
              onClick={() => {
                setSelectedSessionType("Virtual");
                setSelectedTherapyTypes([]);
                setSelectedSpecialties([]);
                setSelectedTreatmentMethods([]);
              }}
            >
              Clear all
            </Button>
            <Button
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-6"
              onClick={() => setIsFiltersModalOpen(false)}
            >
              Show results
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Find a Provider Modal (Mobile Only) */}

      <Dialog open={isFindProviderModalOpen} onOpenChange={setIsFindProviderModalOpen}>
        <DialogContent showCloseButton={false} className="h-full max-h-screen w-full max-w-full rounded-none p-0 gap-0 md:hidden data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-white px-4 h-14 shrink-0">
            <DialogTitle className="text-lg font-semibold">Find a provider</DialogTitle>
            <button
              onClick={() => setIsFindProviderModalOpen(false)}
              className="rounded-md p-2 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <XMarkIcon className="cursor-pointer h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="px-4 py-4">
            {/* Address Section */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                State
              </label>
              <button
                onClick={() => {
                  setIsLocationModalOpen(true);
                  setIsFindProviderModalOpen(false);
                }}
                className="w-full rounded-full border border-gray-300 bg-white px-4 py-3 text-left text-sm text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <span>{location}</span>
                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Payment Method Section */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Payment method
              </label>
              <button
                onClick={() => {
                  setIsPaymentModalOpen(true);
                  setIsFindProviderModalOpen(false);
                }}
                className="w-full rounded-full border border-gray-300 bg-white px-4 py-3 text-left text-sm text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <span>{paymentMethod}</span>
                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Specialties Section */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Specialties
              </label>
              <button
                onClick={() => {
                  setTempSelectedSpecialties(selectedSpecialties);
                  setIsSpecialtiesModalOpen(true);
                  setIsFindProviderModalOpen(false);
                }}
                className="w-full rounded-full border border-gray-300 bg-white px-4 py-3 text-left text-sm text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <span>
                  {selectedSpecialties.length > 0
                    ? `Specialties (${selectedSpecialties.length})`
                    : "Select specialties"}
                </span>
                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Footer with action button */}
          <div className="mt-auto sticky bottom-0 border-t bg-white px-4 py-6 shrink-0">
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-full text-base"
              onClick={() => setIsFindProviderModalOpen(false)}
            >
              Show results
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Location Selector Modal */}
      <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
        <DialogContent showCloseButton={false} className="h-full max-h-screen w-full max-w-full rounded-none p-0 md:hidden">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
              <button
                onClick={() => {
                  setIsLocationModalOpen(false);
                  setIsFindProviderModalOpen(true);
                }}
                className="rounded-md p-2 hover:bg-gray-100 transition-colors"
                aria-label="Back"
              >
                <ArrowLeftIcon className="cursor-pointer h-6 w-6 text-gray-600" />
              </button>
              <DialogTitle className="text-lg font-semibold">State</DialogTitle>
            </div>

            {/* Search */}
            <div className="px-4 pt-4 pb-3">
              <div className="relative">
                <MagnifyingGlassIcon className="cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="pl-10 rounded-lg border-gray-300"
                />
              </div>
            </div>

            {/* List */}
            <ul className="flex-1 overflow-y-auto">
              {locations
                .filter((loc) => loc.toLowerCase().includes(locationSearch.toLowerCase()))
                .map((loc) => (
                  <li
                    key={loc}
                    onClick={() => {
                      setLocation(loc);
                      setIsLocationModalOpen(false);
                      setIsFindProviderModalOpen(true);
                      setLocationSearch("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setLocation(loc);
                        setIsLocationModalOpen(false);
                        setIsFindProviderModalOpen(true);
                        setLocationSearch("");
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={cn(
                      "w-full px-4 py-3 text-left text-sm hover:bg-indigo-50 transition-colors cursor-pointer force-cursor-pointer",
                      location === loc ? "bg-indigo-100 text-gray-900" : "text-gray-700"
                    )}
                  >
                    {loc}
                  </li>
                ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Method Selector Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent showCloseButton={false} className="h-full max-h-screen w-full max-w-full rounded-none p-0 md:hidden">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
              <button
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  setIsFindProviderModalOpen(true);
                }}
                className="rounded-md p-2 hover:bg-gray-100 transition-colors"
                aria-label="Back"
              >
                <ArrowLeftIcon className="cursor-pointer h-6 w-6 text-gray-600" />
              </button>
              <DialogTitle className="text-lg font-semibold">Payment method</DialogTitle>
            </div>

            {/* Search */}
            <div className="px-4 pt-4 pb-3">
              <div className="relative">
                <MagnifyingGlassIcon className="cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search"
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  className="pl-10 rounded-lg border-gray-300"
                />
              </div>
            </div>

            {/* List */}
            <ul className="flex-1 overflow-y-auto">
              {paymentMethods
                .filter((method) => method.toLowerCase().includes(paymentSearch.toLowerCase()))
                .map((method) => (
                  <li
                    key={method}
                    onClick={() => {
                      setPaymentMethod(method);
                      setIsPaymentModalOpen(false);
                      setIsFindProviderModalOpen(true);
                      setPaymentSearch("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setPaymentMethod(method);
                        setIsPaymentModalOpen(false);
                        setIsFindProviderModalOpen(true);
                        setPaymentSearch("");
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={cn(
                      "w-full px-4 py-3 text-left text-sm hover:bg-indigo-50 transition-colors cursor-pointer force-cursor-pointer",
                      paymentMethod === method ? "bg-indigo-100 text-gray-900" : "text-gray-700"
                    )}
                  >
                    {method}
                  </li>
                ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>

      {/* Specialties Selector Modal */}
      <Dialog
        open={isSpecialtiesModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Reset temp state when closing without applying
            setTempSelectedSpecialties(selectedSpecialties);
          }
          setIsSpecialtiesModalOpen(open);
        }}
      >
        <DialogContent showCloseButton={false} className="h-full max-h-screen w-full max-w-full rounded-none p-0 gap-0 md:hidden flex flex-col">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 border-b bg-white px-4 py-3 shrink-0">
              <button
                onClick={() => {
                  setSelectedSpecialties(tempSelectedSpecialties);
                  setIsSpecialtiesModalOpen(false);
                  setIsFindProviderModalOpen(true);
                  setSpecialtiesSearch("");
                }}
                className="rounded-md p-2 hover:bg-gray-100 transition-colors"
                aria-label="Back"
              >
                <ArrowLeftIcon className="cursor-pointer h-6 w-6 text-gray-600" />
              </button>
              <DialogTitle className="text-lg font-semibold">Specialties</DialogTitle>
            </div>

            {/* Search */}
            <div className="px-4 pt-4 pb-3 shrink-0">
              <div className="relative">
                <MagnifyingGlassIcon className="cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search"
                  value={specialtiesSearch}
                  onChange={(e) => setSpecialtiesSearch(e.target.value)}
                  className="pl-10 rounded-lg border-gray-300"
                />
              </div>
            </div>

            {/* Checkbox List - Scrollable */}
            <ul className="flex-1 overflow-y-auto min-h-0">
              {specialtiesList
                .filter((spec) => spec.toLowerCase().includes(specialtiesSearch.toLowerCase()))
                .map((spec) => (
                  <li key={spec}>
                    <label
                      className={cn(
                        "flex items-center gap-3 cursor-pointer px-4 py-4 force-cursor-pointer",
                        tempSelectedSpecialties.includes(spec) ? "bg-indigo-50" : ""
                      )}
                    >
                      <Checkbox
                        checked={tempSelectedSpecialties.includes(spec)}
                        onCheckedChange={() => toggleCheckbox(spec, tempSelectedSpecialties, setTempSelectedSpecialties)}
                      />
                      <span className="text-sm text-gray-900">{spec}</span>
                    </label>
                  </li>
                ))}
            </ul>

            {/* Footer with action buttons - Fixed at bottom */}
            <div className="mt-auto border-t bg-white px-4 pb-6 pt-4 space-y-3 shrink-0">
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-full"
                onClick={() => {
                  setSelectedSpecialties(tempSelectedSpecialties);
                  setIsSpecialtiesModalOpen(false);
                  setIsFindProviderModalOpen(true);
                  setSpecialtiesSearch("");
                }}
              >
                Apply
              </Button>
              <Button
                variant="outline"
                className="w-full py-6 rounded-full"
                onClick={() => {
                  setTempSelectedSpecialties([]);
                }}
              >
                Clear filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
