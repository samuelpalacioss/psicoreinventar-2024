import StripeSessionSuccess from "@/components/stripe-session-success";
import getOrder from "@/utilities/get-order";
import { Suspense } from "react";

interface SuccessPageProps {
  searchParams: { session_id: string };
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id } = await searchParams;

  const stripeSessionId = session_id;
  const order = await getOrder(stripeSessionId);

  console.log("[stripe-success] checkout session id: ", stripeSessionId);
  // console.log(order);

  return (
    <Suspense fallback={"Verifying order..."}>
      <StripeSessionSuccess order={order} />
    </Suspense>
  );
}
