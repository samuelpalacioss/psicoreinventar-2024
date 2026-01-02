import { DashboardContainer } from "@/components/dashboard/dashboard-container";

// Boilerplate user for testing - toggle role to test different views
const boilerplateUser = {
  name: "Samuel Palacios",
  role: "user" as "user" | "doctor", // Change to "doctor" to test doctor view
};

export default function Page() {
  const { name, role } = boilerplateUser;

  const greeting = role === "doctor" ? `Hello doc ${name}` : `Hello my friend ${name}`;

  return (
    <DashboardContainer>
      <div className="max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-light text-gray-900 leading-tight">{greeting}</h1>
        <p className="mt-4 text-base sm:text-lg text-gray-600 font-light leading-relaxed">
          {role === "doctor"
            ? "Welcome back to your practice dashboard."
            : "Welcome back to your wellness journey."}
        </p>
      </div>
    </DashboardContainer>
  );
}
