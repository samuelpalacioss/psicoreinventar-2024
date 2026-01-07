import TherapistDetail, { sampleTherapistDetail } from "@/components/therapist-detail";

export default function TherapistDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TherapistDetail {...sampleTherapistDetail} />
    </div>
  );
}
