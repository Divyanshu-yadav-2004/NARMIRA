import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { ProductGrid } from '../components/ProductGrid';
import { useStore } from '../context/StoreContext';

export const WishlistPage: React.FC = () => {
  const { wishlistProducts } = useStore();

  useEffect(() => {
    document.title = 'Wishlist — NARMIRA';
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
      <div className="pb-6 border-b border-[#D8C8B3]/70 mb-8 flex items-baseline justify-between">
        <h1 className="font-serif text-3xl sm:text-4xl text-[#302820]">
          Saved Pieces
        </h1>
        <span className="text-xs text-[#302820]/65">
          {wishlistProducts.length}{' '}
          {wishlistProducts.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="py-20 text-center bg-white border border-[#D8C8B3]/60 px-6">
          <Heart className="w-10 h-10 text-[#B59A68] stroke-[1.2] mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-[#302820] mb-2">
            Your Wishlist Is Empty
          </h2>
          <p className="text-xs sm:text-sm text-[#302820]/70 max-w-md mx-auto mb-7">
            Tap the heart icon on any saree, kurta set, or dupatta to save it
            for later.
          </p>
          <Link
            to="/shop"
            className="inline-block px-8 py-3.5 bg-[#632D35] hover:bg-[#4E2229] text-[#F8F5EF] text-xs uppercase tracking-[0.18em] transition-colors"
          >
            Discover Collections
          </Link>
        </div>
      ) : (
        <ProductGrid products={wishlistProducts} columnsDesktop={4} />
      )}
    </div>
  );
};
