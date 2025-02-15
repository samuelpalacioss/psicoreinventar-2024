import { Order } from '@/lib/validations/order';

export default async function getOrder(sessionId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/success?session_id=${sessionId}`,
      {
        cache: 'no-store',
      }
    );
    if (!response.ok) {
      throw new Error(`Fetch request failed with status ${response.status} ${response.statusText}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds

    const data: Order = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
