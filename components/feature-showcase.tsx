"use client";

import { useState, useRef, useCallback } from "react";
import { Heart, Calendar, MessageCircle } from "lucide-react";

// Feature data structure
interface Feature {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    id: 1,
    icon: Heart,
    title: "Track Your Progress",
    description: "Visualize your mental health journey with milestone tracking, mood charts, and therapy notes. See how far you've come.",
    color: "#0369a1"
  },
  {
    id: 2,
    icon: Calendar,
    title: "Session Management",
    description: "Manage upcoming appointments, view past sessions, and reschedule with ease. Everything in one place.",
    color: "#0369a1"
  },
  {
    id: 3,
    icon: MessageCircle,
    title: "Message Anytime",
    description: "Stay connected with your therapist between sessions. Send messages, get support, and share updates whenever you need.",
    color: "#0369a1"
  }
];

// Visual mockup data for each feature
const mockupData = {
  1: [
    { period: "Week 1", status: "Severe Anxiety", level: "severe" },
    { period: "Week 3", status: "Frequent Panic Attacks", level: "severe" },
    { period: "Week 5", status: "Moderate Anxiety", level: "moderate" },
    { period: "Week 7", status: "Better Sleep", level: "moderate" },
    { period: "Week 9", status: "Mild Anxiety", level: "mild" },
    { period: "Week 11", status: "More Social", level: "mild" },
    { period: "Week 13", status: "Managing Well", level: "managed" }
  ],
  2: [
    { time: "October 19, 2026", therapist: "Dr. Sarah Mitchell", status: "Upcoming", icon: "📅" },
    { time: "October 12, 2026", therapist: "Dr. Sarah Mitchell", status: "Completed", icon: "✓" },
    { time: "October 5, 2026", therapist: "Dr. Sarah Mitchell", status: "Completed", icon: "✓" },
    { time: "September 28, 2026", therapist: "Dr. Sarah Mitchell", status: "Completed", icon: "✓" }
  ],
  3: [
    { message: "How are you feeling after our last session?", sender: "Dr. Mitchell", time: "2 hours ago", icon: "💬" },
    { message: "I'm feeling much better, the techniques really helped", sender: "You", time: "1 hour ago", icon: "💬" },
    { message: "That's wonderful to hear! Keep practicing them daily", sender: "Dr. Mitchell", time: "1 hour ago", icon: "💬" },
    { message: "Will do, thank you for your support", sender: "You", time: "45 minutes ago", icon: "💬" }
  ]
};

export default function FeatureShowcase() {
  const [activeFeature, setActiveFeature] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-rotation with proper cleanup
  const startAutoRotation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setActiveFeature((prev) => (prev === features.length - 1 ? 0 : prev + 1));
    }, 10000);
  }, []);

  const stopAutoRotation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start auto-rotation on mount, stop on unmount
  if (typeof window !== 'undefined' && !intervalRef.current) {
    startAutoRotation();
  }

  return (
    <section id="feature-showcase" className="px-6 py-20 sm:py-24">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <h2 className="text-4xl md:text-5xl font-normal tracking-tight text-gray-900 mb-4">
            Your journey, supported every step
          </h2>
          <p className="text-base leading-relaxed text-gray-600">
            Track your progress, manage your sessions, and stay connected with your therapist. Everything you need for your mental wellness journey.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col md:grid md:grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start">
          {/* Features Section */}
          <div className="w-full">
            {/* Mobile Layout: Vertical list with inline mockups */}
            <div className="md:hidden space-y-6">
              {features.map((feature, index) => {
                const isActive = index === activeFeature;
                const Icon = feature.icon;

                return (
                  <div key={feature.id}>
                    {/* Feature Card */}
                    <button
                      onClick={() => setActiveFeature(index)}
                      className="w-full text-left bg-white rounded-lg p-6 border border-gray-300 hover:border-gray-400 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                            isActive ? "scale-105" : ""
                          }`}
                          style={{
                            backgroundColor: isActive ? `${feature.color}10` : "#f9fafb"
                          }}
                        >
                          <Icon
                            className="w-6 h-6"
                            style={{ color: isActive ? feature.color : "#6b7280" }}
                          />
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
                              isActive ? "text-gray-900" : "text-gray-900"
                            }`}
                          >
                            {feature.title}
                          </h3>
                          <p
                            className="text-sm leading-relaxed text-gray-600"
                          >
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Inline Mockup for Active Feature on Mobile */}
                    {isActive && (
                      <div className="relative w-full mt-4">
                        <div className="relative rounded-lg bg-gray-50 border border-gray-300 p-6">
                            {/* Progress Tracking View */}
                            {activeFeature === 0 && (
                              <div className="space-y-2">
                                <div className="mb-3">
                                  <h4 className="text-base font-medium text-gray-800 mb-1">How you're doing</h4>
                                  <p className="text-xs text-gray-500">Small steps add up</p>
                                </div>
                                {mockupData[1].map((item, idx) => {
                                  return (
                                    <div key={idx} className="relative pl-6">
                                      {/* Simple connection line */}
                                      {idx < mockupData[1].length - 1 && (
                                        <div className="absolute left-2 top-5 w-px h-5 bg-gray-200" />
                                      )}

                                      {/* Simple dot */}
                                      <div className={`absolute left-0.5 top-1.5 w-3 h-3 rounded-full border-2 border-gray-300 ${
                                        item.level === 'managed' ? 'bg-gray-700' : 'bg-white'
                                      }`} />

                                      <div className="pb-1">
                                        <div className="flex items-baseline justify-between gap-2">
                                          <p className="text-xs text-gray-700">{item.status}</p>
                                          <p className="text-xs text-gray-400">{item.period}</p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Session Management View */}
                            {activeFeature === 1 && (
                              <div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <h3 className="text-lg font-semibold mb-3 text-gray-900">
                                    Your Sessions
                                  </h3>
                                  <div className="space-y-2">
                                    {mockupData[2].map((item, idx) => (
                                      <div
                                        key={idx}
                                        className={`flex items-center justify-between p-3 rounded-lg ${item.status === "Upcoming" ? "bg-sky-50" : "bg-gray-50"}`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="text-lg">{item.icon}</span>
                                          <div>
                                            <p className="font-semibold text-gray-900 text-sm">
                                              {item.therapist}
                                            </p>
                                            <p className="text-xs text-gray-500">{item.time}</p>
                                          </div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.status === "Upcoming" ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-600"}`}>
                                          {item.status}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Messaging View */}
                            {activeFeature === 2 && (
                              <div className="space-y-3 max-h-80 overflow-y-auto">
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <h3 className="text-lg font-semibold mb-3 text-gray-900">
                                    Messages
                                  </h3>
                                  <div className="space-y-3">
                                    {mockupData[3].map((msg, idx) => (
                                      <div
                                        key={idx}
                                        className={`flex gap-3 ${msg.sender === "You" ? "justify-end" : "justify-start"}`}
                                      >
                                        <div
                                          className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                                            msg.sender === "You"
                                              ? "bg-white text-gray-900 border border-gray-300"
                                              : "bg-gray-100 text-gray-900"
                                          }`}
                                        >
                                          <p className="font-medium text-xs mb-1">{msg.sender}</p>
                                          <p className="text-xs">{msg.message}</p>
                                          <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop Layout: Original card with all features */}
            <div className="hidden md:block relative bg-white rounded-lg p-8 border border-gray-300">
            {features.map((feature, index) => {
              const isActive = index === activeFeature;
              const Icon = feature.icon;

              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(index)}
                  className={`w-full text-left py-6 transition-all duration-300 ${
                    index < features.length - 1 ? "border-b border-gray-300" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isActive ? "scale-105" : ""
                      }`}
                      style={{
                        backgroundColor: isActive ? `${feature.color}10` : "#f9fafb"
                      }}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{ color: isActive ? feature.color : "#6b7280" }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-xl font-semibold mb-2 text-gray-900"
                      >
                        {feature.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed text-gray-600"
                      >
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  </button>
              );
            })}

              {/* Navigation Controls - Hidden on mobile, visible on desktop */}
            <div className="flex items-center justify-center pt-6">
              <div className="flex gap-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFeature(index)}
                      onMouseEnter={stopAutoRotation}
                      onMouseLeave={startAutoRotation}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeFeature
                        ? "w-8 bg-gray-900"
                        : "w-2 bg-gray-500 hover:bg-gray-600"
                    }`}
                    aria-label={`Go to feature ${index + 1}`}
                  />
                ))}
              </div>
              </div>
            </div>
          </div>

          {/* Visual Mockup - Desktop Only: Side by side */}
          <div className="hidden md:block relative w-full">
            <div className="relative rounded-lg bg-gray-50 border border-gray-300 p-8 h-[600px]">
                {/* Progress Tracking View */}
                {activeFeature === 0 && (
                  <div className="h-full flex flex-col justify-center">
                    <div className="bg-white rounded-lg p-6 pb-12 border border-gray-200 max-h-[434px]">
                      <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">How you're doing</h3>
                        <p className="text-sm text-gray-500">Small steps add up</p>
                      </div>
                      <div className="space-y-4">
                        {mockupData[1].map((item, index) => {
                          return (
                            <div key={index} className="relative pl-10">
                              {/* Simple connection line */}
                              {index < mockupData[1].length - 1 && (
                                <div className="absolute left-4 top-7 w-px h-7 bg-gray-200" />
                              )}

                              {/* Simple dot - gets filled for improvement */}
                              <div className={`absolute left-2 top-2.5 w-5 h-5 rounded-full border-2 border-gray-300 ${
                                item.level === 'managed' ? 'bg-gray-700' : 'bg-white'
                              }`} />

                              <div className="pb-1">
                                <div className="flex items-baseline justify-between gap-3">
                                  <p className="text-base text-gray-700">{item.status}</p>
                                  <p className="text-sm text-gray-400">{item.period}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Session Management View */}
                {activeFeature === 1 && (
                  <div className="h-full flex flex-col justify-center">
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h3 className="text-xl font-semibold mb-4 text-gray-900">
                        Your Sessions
                      </h3>
                      <div className="space-y-3">
                        {mockupData[2].map((item, index) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-4 rounded-lg transition-all ${item.status === "Upcoming" ? "bg-sky-50 hover:bg-sky-100" : "bg-gray-50 hover:bg-gray-100"}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{item.icon}</span>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {item.therapist}
                                </p>
                                <p className="text-sm text-gray-500">{item.time}</p>
                              </div>
                            </div>
                            <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${item.status === "Upcoming" ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-600"}`}>
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Messaging View */}
                {activeFeature === 2 && (
                  <div className="h-full flex flex-col justify-center">
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h3 className="text-xl font-semibold mb-4 text-gray-900">
                        Messages
                      </h3>
                      <div className="space-y-3 max-h-85 overflow-y-auto">
                        {mockupData[3].map((msg, index) => (
                          <div
                            key={index}
                            className={`flex gap-3 ${msg.sender === "You" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-xs px-4 py-3 rounded-lg ${
                                msg.sender === "You"
                                  ? "bg-white text-gray-900 border border-gray-300"
                                  : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <p className="font-medium text-sm mb-1">{msg.sender}</p>
                              <p className="text-sm leading-relaxed">{msg.message}</p>
                              <p className="text-xs opacity-70 mt-2">{msg.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
