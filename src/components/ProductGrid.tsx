import React from 'react';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Reveal } from './Reveal';

interface ProductGridProps {
  products: Product[];
  columnsDesktop?: 3 | 4;
  showBestsellerBadge?: boolean;
  showRating?: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  columnsDesktop = 4,
  showBestsellerBadge = false,
  showRating = false,
}) => {
  const gridCols =
    columnsDesktop === 3
      ? 'grid-cols-2 md:grid-cols-3'
      : 'grid-cols-2 lg:grid-cols-4';

  return (
    <div className={`grid ${gridCols} gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-11`}>
      {products.map((product, idx) => (
        <Reveal key={product.id} delayMs={Math.min(idx % 4, 3) * 70}>
          <ProductCard
            product={product}
            showBestsellerBadge={showBestsellerBadge}
            showRating={showRating}
          />
        </Reveal>
      ))}
    </div>
  );
};
