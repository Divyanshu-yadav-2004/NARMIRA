import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  ShoppingBag,
  Star,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { Product } from '../types';
import {
  calculateDiscountPercent,
  formatINR,
  getAvailableSizes,
  getProductVariants,
  normalizeProductImages,
} from '../utils/format';

interface ProductCardProps {
  product: Product;
  showBestsellerBadge?: boolean;
  showRating?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showBestsellerBadge = false,
  showRating = false,
}) => {
  const { addToCart, toggleWishlist, isInWishlist, openQuickView } = useStore();
  const variants = getProductVariants(product);
  const [variantSelection, setVariantSelection] = useState({ productId: product.id, variantId: variants[0]?.id || '' });
  const selectedVariantId = variantSelection.productId === product.id
    ? variantSelection.variantId
    : variants[0]?.id || '';
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) || variants[0];
  const availableSizes = getAvailableSizes(product);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [manualBrowse, setManualBrowse] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);

  const touchStartX = useRef<number | null>(null);

  const wishlisted = isInWishlist(product.id);
  const discountPct = calculateDiscountPercent(
    product.price,
    product.originalPrice
  );

  const images = normalizeProductImages(
    selectedVariant?.images?.length ? selectedVariant.images : product.images,
    product.name
  );
  const hasMultipleImages = images.length > 1;

  useEffect(() => setActiveImageIdx(0), [selectedVariantId]);

  // On desktop hover (when not manually browsing), crossfade to the 2nd image
  const displayedIdx =
    !manualBrowse && isHovered && hasMultipleImages ? 1 : activeImageIdx;

  const goPrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setManualBrowse(true);
    setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const goNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setManualBrowse(true);
    setActiveImageIdx((prev) => (prev + 1) % images.length);
  };

  const handleDotClick = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setManualBrowse(true);
    setActiveImageIdx(idx);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !hasMultipleImages) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 36) {
      setManualBrowse(true);
      setActiveImageIdx((prev) =>
        diff > 0
          ? (prev - 1 + images.length) % images.length
          : (prev + 1) % images.length
      );
    }
    touchStartX.current = null;
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (availableSizes.length !== 1 || !selectedVariant) {
      openQuickView(product, selectedVariant?.id);
      return;
    }
    addToCart(product, {
      color: selectedVariant.color,
      variantId: selectedVariant.id,
      size: availableSizes[0],
      quantity: 1,
    });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHeartAnimating(true);
    toggleWishlist(product);
    window.setTimeout(() => setHeartAnimating(false), 380);
  };

  return (
    <article
      className="group flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setManualBrowse(false);
        setActiveImageIdx(0);
      }}
    >
      {/* Image Frame */}
      <div
        className="relative aspect-[3/4] bg-[#EEE6D8] overflow-hidden mb-3.5"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          {images.map((img, idx) => (
            <img
              key={`${img.src}-${idx}`}
              src={img.src}
              alt={img.alt || product.name}
              loading={idx === 0 ? 'lazy' : 'eager'}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                idx === displayedIdx
                  ? 'opacity-100 scale-100 group-hover:scale-[1.06]'
                  : 'opacity-0 scale-100 pointer-events-none'
              }`}
              style={{
                objectPosition: img.objectPosition || 'center top',
              }}
            />
          ))}
        </Link>

        {/* Single Minimal Top-Left Badge */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          {!product.inStock ? (
            <span className="px-2.5 py-1 bg-[#302820]/85 text-[#F8F5EF] text-[10px] uppercase tracking-[0.14em]">
              Sold Out
            </span>
          ) : discountPct ? (
            <span className="px-2.5 py-1 bg-[#632D35] text-[#F8F5EF] text-[10px] uppercase tracking-[0.14em]">
              {discountPct}% Off
            </span>
          ) : showBestsellerBadge && product.isBestseller ? (
            <span className="px-2.5 py-1 bg-[#F8F5EF]/95 text-[#302820] border border-[#B59A68]/60 text-[10px] uppercase tracking-[0.14em]">
              Bestseller
            </span>
          ) : product.isNewArrival ? (
            <span className="px-2.5 py-1 bg-[#F8F5EF]/95 text-[#302820] border border-[#D8C8B3] text-[10px] uppercase tracking-[0.14em]">
              New
            </span>
          ) : null}
        </div>

        {/* Wishlist Heart */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center transition-colors ${
            wishlisted
              ? 'bg-[#632D35] text-[#F8F5EF]'
              : 'bg-[#F8F5EF]/90 text-[#302820] hover:text-[#632D35]'
          }`}
        >
          <Heart
            className={`w-4 h-4 stroke-[1.5] transition-transform ${
              wishlisted ? 'fill-current' : ''
            } ${heartAnimating ? 'animate-heart-pop' : ''}`}
          />
        </button>

        {/* In-Card Image Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={goPrevImage}
              aria-label="Previous product image"
              className="hidden sm:flex opacity-0 group-hover:opacity-100 absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-[#F8F5EF]/90 hover:bg-white text-[#302820] items-center justify-center transition-all duration-300"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[1.6]" />
            </button>
            <button
              type="button"
              onClick={goNextImage}
              aria-label="Next product image"
              className="hidden sm:flex opacity-0 group-hover:opacity-100 absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-[#F8F5EF]/90 hover:bg-white text-[#302820] items-center justify-center transition-all duration-300"
            >
              <ChevronRight className="w-3.5 h-3.5 stroke-[1.6]" />
            </button>
          </>
        )}

        {/* Image Indicator Dots */}
        {hasMultipleImages && (
          <div className="absolute bottom-13 sm:bottom-14 inset-x-0 z-10 flex items-center justify-center gap-1.5 pointer-events-auto opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleDotClick(e, idx)}
                aria-label={`View image ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === displayedIdx
                    ? 'w-4 bg-[#F8F5EF]'
                    : 'w-1.5 bg-[#F8F5EF]/55 hover:bg-[#F8F5EF]/85'
                }`}
              />
            ))}
          </div>
        )}

        {/* Secondary Action Bar: Quick View + Quick Add */}
        <div
          className="
            absolute inset-x-2 sm:inset-x-2.5 bottom-2 sm:bottom-2.5 z-10 flex items-center gap-1.5
            sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0
            transition-all duration-300 ease-out
          "
        >
          <button
            type="button"
            onClick={handleQuickView}
            aria-label={`Quick view ${product.name}`}
            className="w-9 sm:w-auto h-9 px-0 sm:px-2.5 bg-[#F8F5EF]/95 hover:bg-white text-[#302820] border border-[#D8C8B3]/70 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.14em] transition-colors shrink-0"
          >
            <Eye className="w-3.5 h-3.5 stroke-[1.5]" />
            <span className="hidden xl:inline">Quick View</span>
          </button>

          {product.inStock && (
            <button
              type="button"
              onClick={handleQuickAdd}
              className="flex-1 h-9 px-2 sm:px-2.5 bg-[#F8F5EF]/95 hover:bg-[#632D35] text-[#302820] hover:text-[#F8F5EF] border border-[#D8C8B3]/70 hover:border-[#632D35] text-[10px] uppercase tracking-[0.12em] sm:tracking-[0.15em] flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <ShoppingBag className="w-3.5 h-3.5 stroke-[1.5] shrink-0" />
              <span className="sm:hidden">{availableSizes.length === 1 ? 'Add' : 'Choose'}</span>
              <span className="hidden sm:inline">{availableSizes.length === 1 ? 'Quick Add' : 'Select Options'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1">
        <p className="text-xs uppercase tracking-[0.18em] text-[#B59A68] mb-1">
          {product.category}
        </p>

        <Link
          to={`/product/${product.slug}`}
          className="font-serif text-[16px] sm:text-lg text-[#302820] hover:text-[#632D35] transition-colors leading-snug"
        >
          {product.name}
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[16px] font-medium text-[#302820]">
            {formatINR(selectedVariant?.price ?? product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-[#302820]/50 line-through">
              {formatINR(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Rating only when explicitly enabled and real data exists */}
        {showRating && product.rating && (
          <div className="flex items-center gap-1.5 mt-1.5 text-sm text-[#302820]/75">
            <Star className="w-3 h-3 fill-[#B59A68] text-[#B59A68]" />
            <span>{product.rating.toFixed(1)}</span>
            {product.reviewCount && (
              <span className="text-[#302820]/50">({product.reviewCount})</span>
            )}
          </div>
        )}

        {/* Color Swatches */}
        {product.colors.length > 0 && (
          <div className="flex items-center gap-2 mt-2.5">
            {variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setVariantSelection({ productId: product.id, variantId: variant.id });
                }}
                title={variant.color.name}
                aria-label={`Select color ${variant.color.name}`}
                aria-pressed={selectedVariant?.id === variant.id}
                className="w-11 h-11 shrink-0 flex items-center justify-center"
              >
                <span
                  className={`block w-[18px] h-[18px] rounded-full border transition-transform ${
                    selectedVariant?.id === variant.id
                      ? 'border-[#302820] scale-110 ring-1 ring-offset-1 ring-[#302820]/40'
                      : 'border-[#D8C8B3]'
                  }`}
                  style={{ backgroundColor: variant.color.hex }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};
