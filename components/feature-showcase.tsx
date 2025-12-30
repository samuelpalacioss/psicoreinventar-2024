"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// Feature data structure
interface Feature {
  id: number;
  title: string;
  description: string;
  accentColor: string;
}

const features: Feature[] = [
  {
    id: 1,
    title: "Track Your Progress",
    description:
      "Visualize your mental health journey with milestone tracking, mood charts, and therapy notes. See how far you've come.",
    accentColor: "bg-rose-200/60",
  },
  {
    id: 2,
    title: "Session Management",
    description:
      "Manage upcoming appointments, view past sessions, and reschedule with ease. Everything in one place.",
    accentColor: "bg-indigo-300/60",
  },
  {
    id: 3,
    title: "Message Anytime",
    description:
      "Stay connected with your therapist between sessions. Send messages, get support, and share updates whenever you need.",
    accentColor: "bg-purple-300/60",
  },
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
    { period: "Week 15", status: "Managing Well", level: "managed" },
  ],
  2: [
    { time: "October 19, 2026", therapist: "Dr. Sarah Mitchell", status: "Upcoming", icon: "📅" },
    { time: "October 12, 2026", therapist: "Dr. Sarah Mitchell", status: "Completed", icon: "✓" },
    { time: "October 5, 2026", therapist: "Dr. Sarah Mitchell", status: "Completed", icon: "✓" },
    { time: "September 28, 2026", therapist: "Dr. Sarah Mitchell", status: "Completed", icon: "✓" },
  ],
  3: [
    {
      message: "How are you feeling after our last session?",
      sender: "Dr. Mitchell",
      time: "2 hours ago",
      icon: "💬",
    },
    {
      message: "I'm feeling much better, the techniques really helped",
      sender: "You",
      time: "1 hour ago",
      icon: "💬",
    },
    {
      message: "That's wonderful to hear! Keep practicing them daily",
      sender: "Dr. Mitchell",
      time: "1 hour ago",
      icon: "💬",
    },
  ],
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
  useEffect(() => {
    startAutoRotation();

    return () => {
      stopAutoRotation();
    };
  }, [startAutoRotation, stopAutoRotation]);

  return (
    <section id="feature-showcase" className="pt-16 sm:pt-24 pb-16 sm:pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 ">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <h2 className="text-4xl md:text-5xl font-normal tracking-tight text-gray-900 mb-4">
            Your journey, supported every step
          </h2>
          <p className="text:base sm:text-lg text-gray-600 leading-relaxed">
            Track your progress, manage your sessions, and stay connected with your therapist.
            Everything you need for your mental wellness journey.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col md:grid md:grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start lg:items-center">
          {/* Features Section */}
          <div className="w-full">
            {/* Mobile Layout: Flowing asymmetric list */}
            <div className="md:hidden space-y-8">
              {features.map((feature, index) => {
                const isActive = index === activeFeature;
                // const marginClasses = ["ml-0", "ml-4", "ml-2"][index];

                return (
                  // <div key={feature.id} className={marginClasses}>
                  <div key={feature.id}>
                    {/* Feature Item */}
                    <div
                      onClick={() => setActiveFeature(index)}
                      className="w-full text-left max-w-sm cursor-pointer transition-all duration-300"
                    >
                      <h3 className="relative inline-block mb-2">
                        <span
                          className={`text-xl font-medium text-gray-900 transition-colors duration-300 ${
                            isActive ? "text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {feature.title}
                        </span>
                        <span
                          className={`absolute -bottom-1 left-0 h-0.5 transition-all duration-300 ${feature.accentColor} ${
                            isActive ? "w-full" : "w-0"
                          }`}
                        />
                      </h3>
                      <p className="text-base leading-7 text-gray-600">{feature.description}</p>
                    </div>

                    {/* Inline Mockup for Active Feature on Mobile */}
                    {isActive && (
                      <div className="relative w-full mt-6">
                        <div className="relative p-4">
                          {/* Progress Tracking View */}
                          {activeFeature === 0 && (
                            <div className="space-y-6">
                              <div>
                                <h3 className="relative inline-block text-xl sm:text-2xl font-light text-gray-900 mb-2">
                                  How you&apos;re{" "}
                                  <span className="relative inline-block">
                                    <span className="relative z-10">doing</span>
                                    <span className="absolute -bottom-0.5 left-0 w-full h-2 bg-rose-200/40 -rotate-1 -z-10" />
                                  </span>
                                </h3>
                                <p className="text-sm text-gray-500 font-light">Small steps add up</p>
                              </div>
                              <div className="space-y-4">
                                {mockupData[1].map((item, idx) => {
                                  return (
                                    <div key={idx}>
                                      <div className="flex items-baseline justify-between gap-3">
                                        <p className={`text-base font-light ${item.level === "managed" ? "text-gray-900" : "text-gray-600"}`}>
                                          {item.status}
                                        </p>
                                        <p className="text-sm text-gray-400 font-light">{item.period}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Session Management View */}
                          {activeFeature === 1 && (
                            <div className="space-y-6">
                              <div>
                                <h3 className="relative inline-block text-xl sm:text-2xl font-light text-gray-900 mb-2">
                                  Your{" "}
                                  <span className="relative inline-block">
                                    <span className="relative z-10">sessions</span>
                                    <span className="absolute -bottom-0.5 left-0 w-full h-2 bg-indigo-200/40 -rotate-1 -z-10" />
                                  </span>
                                </h3>
                                <p className="text-sm text-gray-500 font-light">All in one place</p>
                              </div>
                              <div className="space-y-4">
                                {mockupData[2].map((item, idx) => {
                                  return (
                                    <div key={idx}>
                                      <div className="flex items-baseline justify-between gap-3">
                                        <div>
                                          <p className={`text-base font-light ${item.status === "Upcoming" ? "text-gray-900" : "text-gray-600"}`}>
                                            {item.status === "Upcoming" ? (
                                              <span className="relative inline-block">{item.therapist}</span>
                                            ) : (
                                              item.therapist
                                            )}
                                          </p>
                                          <p className="text-sm text-gray-400 font-light mt-1">{item.time}</p>
                                        </div>
                                        <span className={`text-sm font-light ${item.status === "Upcoming" ? "text-indigo-600" : "text-gray-400"}`}>
                                          {item.status}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Messaging View */}
                          {activeFeature === 2 && (
                            <div className="space-y-6">
                              <div>
                                <h3 className="relative inline-block text-xl sm:text-2xl font-light text-gray-900 mb-2">
                                  Stay{" "}
                                  <span className="relative inline-block">
                                    <span className="relative z-10">connected</span>
                                    <span className="absolute -bottom-0.5 left-0 w-full h-2 bg-purple-200/40 -rotate-1 -z-10" />
                                  </span>
                                </h3>
                                <p className="text-sm text-gray-500 font-light">Between sessions</p>
                              </div>
                              <div className="space-y-4">
                                {mockupData[3].map((msg, idx) => {
                                  const marginClasses = msg.sender === "You" ? "ml-8" : "ml-0";
                                  return (
                                    <div
                                      key={idx}
                                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                                        msg.sender === "You"
                                          ? "bg-white text-gray-900 border border-gray-300"
                                          : "bg-gray-100 text-gray-900"
                                      } ${marginClasses}`}
                                    >
                                      <p className="text-xs text-gray-600 font-medium mb-1">{msg.sender}</p>
                                      <p className={`text-sm leading-relaxed font-light ${msg.sender === "You" ? "text-gray-600" : "text-gray-900"}`}>
                                        {msg.sender === "Dr. Mitchell" && idx === 0 ? (
                                          <>How are you feeling after our last session?</>
                                        ) : (
                                          msg.message
                                        )}
                                      </p>
                                      <p className="text-xs text-gray-400 font-light mt-1">{msg.time}</p>
                                    </div>
                                  );
                                })}
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

            {/* Desktop Layout: Flowing asymmetric list */}
            <div className="hidden md:block relative space-y-10 max-w-xl">
              {features.map((feature, index) => {
                const isActive = index === activeFeature;
                // const marginClasses = ["ml-0", "ml-12", "ml-4"][index];

                return (
                  <div
                    key={feature.id}
                    onClick={() => setActiveFeature(index)}
                    className={`w-full text-left transition-all duration-300 cursor-pointer max-w-md`}
                    // className={`w-full text-left transition-all duration-300 cursor-pointer max-w-md ${marginClasses}`}
                  >
                    <h3 className="relative inline-block mb-2">
                      <span
                        className={`text-2xl font-medium transition-colors duration-300 ${
                          isActive ? "text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {feature.title}
                      </span>
                      <span
                        className={`absolute -bottom-1 left-0 h-0.5 transition-all duration-300 ${feature.accentColor} ${
                          isActive ? "w-full" : "w-0"
                        }`}
                      />
                    </h3>
                    <p className="text-base leading-7 text-gray-600">{feature.description}</p>
                  </div>
                );
              })}

              {/* Navigation Controls */}
              <div className="flex items-center pt-6 ml-4">
                <div className="flex gap-2">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveFeature(index)}
                      onMouseEnter={stopAutoRotation}
                      onMouseLeave={startAutoRotation}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        index === activeFeature
                          ? "w-6 bg-gray-700"
                          : "w-1.5 bg-gray-300 hover:bg-gray-400"
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
            <div className="relative p-8 h-[600px] flex flex-col justify-center">
              {/* Progress Tracking View */}
              {activeFeature === 0 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="relative inline-block text-2xl sm:text-3xl font-light text-gray-900 mb-2">
                      How you&apos;re{" "}
                      <span className="relative inline-block">
                        <span className="relative z-10">doing</span>
                        <span className="absolute -bottom-0.5 left-0 w-full h-2 bg-rose-200/40 -rotate-1 -z-10" />
                      </span>
                    </h3>
                    <p className="text-base text-gray-500 font-light">Small steps add up</p>
                  </div>
                  <div className="space-y-6 max-w-md">
                    {mockupData[1].map((item, index) => {
                      return (
                        <div key={index}>
                          <div className="flex items-baseline justify-between gap-4">
                            <p
                              className={`text-lg font-light ${item.level === "managed" ? "text-gray-900" : "text-gray-600"}`}
                            >
                              {item.status}
                            </p>
                            <p className="text-sm text-gray-400 font-light">{item.period}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Session Management View */}
              {activeFeature === 1 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="relative inline-block text-2xl sm:text-3xl font-light text-gray-900 mb-2">
                      Your{" "}
                      <span className="relative inline-block">
                        <span className="relative z-10">sessions</span>
                        <span className="absolute -bottom-0.5 left-0 w-full h-2 bg-indigo-200/40 -rotate-1 -z-10" />
                      </span>
                    </h3>
                    <p className="text-base text-gray-500 font-light">All in one place</p>
                  </div>
                  <div className="space-y-6 max-w-lg">
                    {mockupData[2].map((item, index) => {
                      return (
                        <div key={index}>
                          <div className="flex items-baseline justify-between gap-4">
                            <div>
                              <p
                                className={`text-lg font-light ${item.status === "Upcoming" ? "text-gray-900" : "text-gray-600"}`}
                              >
                                {item.status === "Upcoming" ? (
                                  <span className="relative inline-block">{item.therapist}</span>
                                ) : (
                                  item.therapist
                                )}
                              </p>
                              <p className="text-sm text-gray-400 font-light mt-1">{item.time}</p>
                            </div>
                            <span
                              className={`text-sm font-light ${item.status === "Upcoming" ? "text-indigo-600" : "text-gray-400"}`}
                            >
                              {item.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Messaging View */}
              {activeFeature === 2 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="relative inline-block text-2xl sm:text-3xl font-light text-gray-900 mb-2">
                      Stay{" "}
                      <span className="relative inline-block">
                        <span className="relative z-10">connected</span>
                        <span className="absolute -bottom-0.5 left-0 w-full h-2 bg-purple-200/40 -rotate-1 -z-10" />
                      </span>
                    </h3>
                    <p className="text-base text-gray-500 font-light">Between sessions</p>
                  </div>
                  <div className="space-y-5 max-w-lg">
                    {mockupData[3].map((msg, index) => {
                      const marginClasses = msg.sender === "You" ? "ml-12" : "ml-0";
                      return (
                        <div
                          key={index}
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.sender === "You"
                              ? "bg-white text-gray-900 border border-gray-300"
                              : "bg-gray-100 text-gray-900"
                          } ${marginClasses}`}
                        >
                          <p className="text-sm text-gray-600 font-medium mb-1">{msg.sender}</p>
                          <p
                            className={`text-base leading-relaxed font-light ${
                              msg.sender === "You" ? "text-gray-600" : "text-gray-900"
                            }`}
                          >
                            {msg.sender === "Dr. Mitchell" && index === 0 ? (
                              <>How are you feeling after our last session?</>
                            ) : (
                              msg.message
                            )}
                          </p>
                          <p className="text-xs text-gray-400 font-light mt-1">{msg.time}</p>
                        </div>
                      );
                    })}
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
