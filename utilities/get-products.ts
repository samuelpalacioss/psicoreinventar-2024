import { Product } from '@/lib/validations/product';

export default async function getProducts() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
      next: {
        revalidate: 60, // !Revalidate for now (pending server actions to invalidate cache)
      },
    });
    if (!response.ok) {
      throw new Error('Something went wrong EN EL FETCH DE PRODUCTOS');
    }
    const data: Product[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
