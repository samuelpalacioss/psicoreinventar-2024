import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DashboardContainer } from "@/components/dashboard/dashboard-container";
import { getServerSession } from "@/lib/auth/session";
import { ProfileSettings } from "@/components/dashboard/profile-settings";
import { getProfileAction } from "@/actions/profile";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH_ROUTES } from "@/config/auth";

export default async function ProfilePage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect(AUTH_ROUTES.LOGIN);
  }

  const { data: profileData } = await getProfileAction();

  return (
    <DashboardContainer
      title="Profile"
      description="Manage your personal details and account settings."
    >
      <Suspense fallback={<ProfileSettingsSkeleton />}>
        <ProfileSettings
          user={{
            name: session.user.name,
            email: session.user.email,
            birthDate: profileData?.birthDate,
            phoneAreaCode: profileData?.phoneAreaCode,
            phoneNumber: profileData?.phoneNumber,
          }}
        />
      </Suspense>
    </DashboardContainer>
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
