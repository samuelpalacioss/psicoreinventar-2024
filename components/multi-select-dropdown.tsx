"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Checkbox } from "./ui/checkbox";

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export function MultiSelectDropdown({ label, options, selectedValues, onChange }: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(v => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 h-9 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-0"
      >
        {label}
        <ChevronDownIcon className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 z-50 min-w-[200px] rounded-md border bg-white shadow-lg">
            <div className="p-2 max-h-[300px] overflow-y-auto">
              {options.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded cursor-pointer"
                >
                  <Checkbox
                    checked={selectedValues.includes(option)}
                    onCheckedChange={() => toggleOption(option)}
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}