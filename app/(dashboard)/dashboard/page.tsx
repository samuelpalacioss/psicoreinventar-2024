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
    <DashboardContainer
      title={greeting}
      description={
        role === "doctor"
          ? "Welcome back to your practice dashboard."
          : "Welcome back to your wellness journey."
      }
    >
      <span>holaaaa</span>
    </DashboardContainer>
  );
}
