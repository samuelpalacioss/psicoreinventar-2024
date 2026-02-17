import { DashboardContainer } from "@/components/dashboard/dashboard-container";
import { PayoutCard, type PayoutMethod } from "@/components/dashboard/payout-card";

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

export default function PayoutsPage() {
  return (
    <DashboardContainer
      title="Payout Methods"
      description="Manage how you receive your earnings. Set a preferred method for automatic payouts."
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockPayoutMethods.map((method) => (
          <PayoutCard key={method.id} method={method} />
        ))}
      </div>
    </DashboardContainer>
  );
}
