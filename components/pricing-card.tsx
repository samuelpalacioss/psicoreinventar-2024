import { Check } from "lucide-react";

interface PricingCardProps {
  range: string;
  insurance: boolean;
  slidingScale: boolean;
}

export default function PricingCard({ range, insurance, slidingScale }: PricingCardProps) {
  return (
    <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm max-w-lg mx-auto">
      <h3 className="text-2xl font-medium text-gray-900 mb-6">Session Pricing</h3>

      <div className="space-y-6">
        <div>
          <div className="text-4xl font-normal text-gray-900 mb-2">{range}</div>
          <p className="text-base text-gray-600">per session</p>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-200">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <span className="text-base text-gray-600">
              {insurance ? "Insurance accepted" : "Self-pay options available"}
            </span>
          </div>

          {slidingScale && (
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <span className="text-base text-gray-600">Sliding scale available for eligible clients</span>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <span className="text-base text-gray-600">No hidden fees or commitments</span>
          </div>

          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <span className="text-base text-gray-600">Cancel or reschedule anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
