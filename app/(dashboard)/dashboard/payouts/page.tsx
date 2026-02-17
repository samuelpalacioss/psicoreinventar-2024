import { redirect } from "next/navigation";
import { DashboardContainer } from "@/components/dashboard/dashboard-container";
import { PayoutCard, type PayoutMethod } from "@/components/dashboard/payout-card";
import { getServerSession } from "@/lib/auth/session";
import { AUTH_ROUTES } from "@/config/auth";
import { Role } from "@/src/types";
import { hasPermission } from "@/utils/api/authorization/permissions";

const mockPayoutMethods: PayoutMethod[] = [
  {
    id: 1,
    type: "bank_transfer",
    nickname: "Mercantil Savings",
    isPreferred: true,
    bankName: "Banco Mercantil",
    accountNumber: "01050012345678901234",
    accountType: "Savings",
  },
  {
    id: 2,
    type: "zelle",
    nickname: "Personal Zelle",
    isPreferred: false,
    zelleEmail: "doctor@example.com",
    zellePhone: "+1 (305) 555-0182",
  },
  {
    id: 3,
    type: "pago_movil",
    nickname: "Banesco Pago Móvil",
    isPreferred: false,
    pagoMovilPhone: "0414-1234567",
    pagoMovilBankCode: "0134",
    pagoMovilCi: 12345678,
  },
  {
    id: 4,
    type: "cash",
    nickname: "In-person sessions",
    isPreferred: false,
  },
];

export default async function PayoutsPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect(AUTH_ROUTES.LOGIN);
  }

  const canList = hasPermission(session.user.role as Role, "payout-method", "list");
  if (!canList || canList === "none") {
    redirect("/dashboard");
  }

  const sortedMethods = [...mockPayoutMethods].sort((a, b) => {
    if (a.isPreferred === b.isPreferred) return 0;
    return a.isPreferred ? -1 : 1;
  });

  return (
    <DashboardContainer
      title="Payout Methods"
      description="Manage how you receive your earnings. Set a preferred method for automatic payouts."
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sortedMethods.map((method) => (
          <PayoutCard key={method.id} method={method} />
        ))}
      </div>
    </DashboardContainer>
  );
}
