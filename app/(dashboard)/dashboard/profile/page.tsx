import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DashboardContainer } from "@/components/dashboard/dashboard-container";
import { getServerSession } from "@/lib/auth/session";
import { ProfileSettings } from "@/components/dashboard/profile-settings";
import { getProfileAction } from "@/actions/profile";
import { Skeleton } from "@/components/ui/skeleton";

async function ProfileSettingsLoader() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  const { data: profileData } = await getProfileAction();

  return (
    <ProfileSettings
      user={{
        name: session.user.name,
        email: session.user.email,
        birthDate: profileData?.birthDate,
        phoneAreaCode: profileData?.phoneAreaCode,
        phoneNumber: profileData?.phoneNumber,
      }}
    />
  );
}

function ProfileSettingsSkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Skeleton className="h-[152px] w-full rounded-lg" />
      <Skeleton className="h-[112px] w-full rounded-lg" />
      <Skeleton className="h-[112px] w-full rounded-lg" />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <DashboardContainer
      title="Profile"
      description="Manage your personal details and account settings."
    >
      <Suspense fallback={<ProfileSettingsSkeleton />}>
        <ProfileSettingsLoader />
      </Suspense>
    </DashboardContainer>
  );
}
