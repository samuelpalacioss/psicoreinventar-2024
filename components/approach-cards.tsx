interface Approach {
  name: string;
  description: string;
  bestFor: string;
}

interface ApproachCardsProps {
  approaches: Approach[];
}

export default function ApproachCards({ approaches }: ApproachCardsProps) {
  return (
    <div className="grid sm:grid-cols-2 gap-6">
      {approaches.map((approach, index) => (
        <div
          key={index}
          className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm space-y-4"
        >
          <h3 className="text-xl font-medium text-gray-900">{approach.name}</h3>
          <p className="text-base text-gray-600 leading-relaxed">{approach.description}</p>
          <div className="pt-2">
            <span className="text-sm font-medium text-indigo-600">Best for: </span>
            <span className="text-sm text-gray-600">{approach.bestFor}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
