import { redirect } from "next/navigation";
import { DashboardContainer } from "@/components/dashboard/dashboard-container";
import { getServerSession } from "@/lib/auth/session";
import { AUTH_ROUTES } from "@/config/auth";
import { Suspense } from "react";
import { paymentsColumns, PaymentType, type Payment } from "@/components/dashboard/payments-columns";
import { DataTable } from "@/components/dashboard/data-table";

const mockPayments: Payment[] = [
  {
    id: 1,
    date: "2024-02-15",
    amount: 80.00,
    doctorName: "Dr. Elena Vargas",
    serviceName: "Talk Therapy",
    paymentType: "pago_movil",
    paymentNickname: "My Pago Móvil",
    paymentDetails: "+58 412 5551234",
  },
  {
    id: 2,
    date: "2024-01-30",
    amount: 120.00,
    doctorName: "Dr. Elena Vargas",
    serviceName: "Couples Therapy",
    paymentType: "zelle",
    paymentNickname: "Personal Zelle",
    paymentDetails: "patient@email.com",
  },
  {
    id: 3,
    date: "2024-01-15",
    amount: 80.00,
    doctorName: "Dr. Elena Vargas",
    serviceName: "Talk Therapy",
    paymentType: "bank_transfer",
    paymentNickname: "Banesco Account",
    paymentDetails: "•••• 7890",
  },
  {
    id: 4,
    date: "2023-12-20",
    amount: 90.00,
    doctorName: "Dr. Marco Reyes",
    serviceName: "Teen Therapy",
    paymentType: "cash",
    paymentNickname: "Cash",
    paymentDetails: "In-person",
  },
  {
    id: 5,
    date: "2023-12-05",
    amount: 80.00,
    doctorName: "Dr. Marco Reyes",
    serviceName: "Talk Therapy",
    paymentType: "pago_movil",
    paymentNickname: "My Pago Móvil",
    paymentDetails: "+58 412 5551234",
  },
];

export default async function PaymentsPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect(AUTH_ROUTES.LOGIN);
  }

  return (
    <DashboardContainer
      title="Payments"
      description="View your payment history and manage billing information for your sessions."
    >
      <Suspense fallback={<div>Loading...</div>}>
        <DataTable
          data={mockPayments}
          columns={paymentsColumns}
          searchKey={["doctorName", "serviceName", "date"]}
          searchPlaceholder="Search by doctor, service, date"
          filterKey="paymentType"
          filterTitle="Payment Method"
          filterLabels={PaymentType}
        />
      </Suspense>
    </DashboardContainer>
  );
}
