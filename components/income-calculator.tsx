"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "./ui/button";

export default function IncomeCalculator() {
  const [sessionsPerWeek, setSessionsPerWeek] = useState([20]);

  const averageRate = 40;
  const weeksPerMonth = 4;

  const calculateIncome = () => {
    const sessions = sessionsPerWeek[0];
    const monthly = sessions * averageRate * weeksPerMonth;
    return monthly.toLocaleString();
  };

  return (
    <div className="bg-white rounded-xl p-8 lg:p-10 border border-gray-200 shadow-sm">
      <h3 className="text-2xl font-normal text-gray-900 mb-8">Earnings estimate</h3>

      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="sessions" className="block text-sm text-gray-600">
              Weekly hours
            </label>
            <span className="text-sm font-medium text-gray-900">{sessionsPerWeek[0]}</span>
          </div>
          <Slider
            value={sessionsPerWeek}
            onValueChange={setSessionsPerWeek}
            min={4}
            max={40}
            step={1}
            className="w-full [&_[role=slider]]:border-indigo-600 [&_[role=slider]]:bg-white [&>span>span]:bg-indigo-600"
          />
        </div>

        <div className="pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">Estimated annual earnings</p>
          <div className="mb-3">
            <span className="text-5xl font-normal text-indigo-600">${calculateIncome()}</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Plus bonuses for engagement with new clients
          </p>
        </div>

        <Button className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-lg font-medium transition-colors">
          Apply now
        </Button>
      </div>
    </div>
  );
}
