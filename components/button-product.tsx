'use client';

import { Button } from '@/components/ui/button';
import { Product } from '@/lib/validations/product';

interface ProductButtonProps {
  product: Product;
}

export default function ProductButton({ product }: ProductButtonProps) {
  return (
    <Button
      className='mt-8'
      onClick={() => {
        console.log(product);
      }}
    >
      Product data :D
    </Button>
  );
}
