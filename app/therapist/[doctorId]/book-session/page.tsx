export default async function BookSession({
  params,
}: {
  params: Promise<{ doctorId: string }>;
}) {
  const { doctorId } = await params;

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-4">Book a Session</h1>
      <p className="text-gray-600">Booking page for therapist ID: {doctorId}</p>
      <p className="text-sm text-gray-500 mt-2">This page is under construction.</p>
    </div>
  );
}
