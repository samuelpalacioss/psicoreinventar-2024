import { ReactNode } from "react";

interface Challenge {
  icon: ReactNode;
  title: string;
  description: string;
}

interface ChallengeGridProps {
  challenges: Challenge[];
}

export default function ChallengeGrid({ challenges }: ChallengeGridProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {challenges.map((challenge, index) => (
        <div key={index} className="space-y-4">
          <div className="w-12 h-12 flex items-center justify-center text-indigo-600">
            {challenge.icon}
          </div>
          <h3 className="text-xl font-medium text-gray-900">{challenge.title}</h3>
          <p className="text-base text-gray-600 leading-relaxed">{challenge.description}</p>
        </div>
      ))}
    </div>
  );
}
