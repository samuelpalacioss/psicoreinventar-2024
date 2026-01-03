import TherapistDetail, { sampleTherapistDetail } from "@/components/therapist-detail";

export default function TherapistDemoPage() {
  console.log("Sample therapist data:", sampleTherapistDetail);

  return (
    <div className="min-h-screen bg-gray-50">
      <TherapistDetail {...sampleTherapistDetail} />
    </div>
  );
}
