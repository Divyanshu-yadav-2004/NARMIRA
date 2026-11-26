import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Heart,
  Minus,
  Plus,
  Ruler,
  ShoppingBag,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { calculateDiscountPercent, formatINR, getAvailableSizes, getProductVariants } from '../utils/format';
import { ProductGallery } from './ProductGallery';
import { SizeGuideModal } from './SizeGuideModal';

export const QuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    quickViewVariantId,
    closeQuickView,
    addToCart,
    toggleWishlist,
    isInWishlist,
  } = useStore();

  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sizeSelectionError, setSizeSelectionError] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const variants = quickViewProduct ? getProductVariants(quickViewProduct) : [];
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) || variants[0];
  const selectedColor = selectedVariant?.color;
  const availableSizes = quickViewProduct ? getAvailableSizes(quickViewProduct) : [];
  const sizeIsValid = availableSizes.includes(selectedSize);
  const galleryImages = selectedVariant?.images?.length
    ? selectedVariant.images
    : quickViewProduct?.images || [];

  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    window.setTimeout(() => {
      setIsClosing(false);
      closeQuickView();
      previousFocusRef.current?.focus();
    }, 210);
  }, [closeQuickView]);

  useEffect(() => {
    if (quickViewProduct) {
      setIsClosing(false);
      const currentVariants = getProductVariants(quickViewProduct);
      const initialVariant = currentVariants.find((variant) => variant.id === quickViewVariantId)
        || currentVariants[0];
      setSelectedVariantId(initialVariant?.id || '');
      const currentAvailableSizes = getAvailableSizes(quickViewProduct);
      setSelectedSize(currentAvailableSizes.length === 1 ? currentAvailableSizes[0] : '');
      setQuantity(1);
      setSizeSelectionError(false);
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      window.requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
    }
  }, [quickViewProduct, quickViewVariantId]);

  // Lock background scroll & handle Escape key
  useEffect(() => {
    if (!quickViewProduct) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (sizeGuideOpen) setSizeGuideOpen(false);
        else handleClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [quickViewProduct, sizeGuideOpen, handleClose]);

  if (!quickViewProduct) return null;

  const wishlisted = isInWishlist(quickViewProduct.id);
  const discountPct = calculateDiscountPercent(
    quickViewProduct.price,
    quickViewProduct.originalPrice
  );
  const handleAdd = () => {
    if (!sizeIsValid || !selectedVariant) {
      setSizeSelectionError(true);
      return;
    }
    addToCart(quickViewProduct, {
      color: selectedColor,
      variantId: selectedVariant?.id,
      size: selectedSize,
      quantity,
    });
    handleClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view for ${quickViewProduct.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-[#302820]/55 backdrop-blur-[3px] transition-opacity duration-200 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div
        className={`relative z-10 w-full max-w-5xl bg-[#F8F5EF] border border-[#D8C8B3] shadow-2xl max-h-[92vh] overflow-y-auto transition-all duration-200 ${
          isClosing
            ? 'opacity-0 scale-[0.98] translate-y-2'
            : 'animate-modal-in'
        }`}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={handleClose}
          aria-label="Close quick view"
          className="sticky top-3 float-right mr-3 mt-3 z-20 w-9 h-9 bg-[#F8F5EF]/95 hover:bg-white border border-[#D8C8B3] flex items-center justify-center text-[#302820] hover:text-[#632D35] transition-colors"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 p-5 sm:p-8 lg:p-10 clear-both lg:clear-none">
          {/* Left: Gallery with Thumbnails & Zoom */}
          <div className="lg:col-span-6">
            <ProductGallery
              key={`${quickViewProduct.id}-${selectedVariant?.id || 'default'}`}
              images={galleryImages}
              productName={quickViewProduct.name}
              compactMobile
            />
          </div>

          {/* Right: Product Info & Controls */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <p className="text-xs sm:text-[11px] uppercase tracking-[0.22em] text-[#B59A68] mb-1.5">
                {quickViewProduct.category}
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#302820] font-normal leading-tight">
                {quickViewProduct.name}
              </h2>

              <div className="flex items-baseline gap-3 mt-3 pb-4 border-b border-[#D8C8B3]/70">
                <span className="text-xl font-medium text-[#302820]">
                  {formatINR(selectedVariant?.price ?? quickViewProduct.price)}
                </span>
                {quickViewProduct.originalPrice &&
                  quickViewProduct.originalPrice > quickViewProduct.price && (
                    <>
                      <span className="text-sm text-[#302820]/45 line-through">
                        {formatINR(quickViewProduct.originalPrice)}
                      </span>
                      <span className="px-2 py-0.5 bg-[#632D35]/10 text-[#632D35] text-[10px] uppercase tracking-[0.14em]">
                        Save {discountPct}%
                      </span>
                    </>
                  )}
              </div>

              <p className="text-[15px] sm:text-sm text-[#302820]/80 leading-relaxed mt-4">
                {quickViewProduct.shortDescription}
              </p>

              <p className="text-sm sm:text-xs text-[#302820]/70 mt-3">
                <span className="uppercase tracking-[0.12em] text-[#302820]/50">
                  Fabric:{' '}
                </span>
                <span className="font-medium text-[#302820]">
                  {quickViewProduct.fabric}
                </span>
              </p>

              {/* Color Selection */}
              <div className="mt-5">
                <p className="text-sm sm:text-xs uppercase tracking-[0.14em] text-[#302820]/70 mb-2">
                  Color:{' '}
                  <strong className="font-medium text-[#302820]">
                    {selectedColor?.name}
                  </strong>
                </p>
                <div className="flex items-center gap-2.5">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      aria-label={`Select color ${variant.color.name}`}
                      aria-pressed={selectedVariant?.id === variant.id}
                      className={`w-6 h-6 rounded-full border transition-all ${
                        selectedVariant?.id === variant.id
                          ? 'border-[#302820] ring-2 ring-offset-2 ring-[#632D35]'
                          : 'border-[#D8C8B3]'
                      }`}
                      style={{ backgroundColor: variant.color.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-sm sm:text-xs mb-2">
                  <span className="uppercase tracking-[0.14em] text-[#302820]/70">
                    Size:{' '}
                    <strong className="font-medium text-[#302820]">
                      {selectedSize || 'Choose size'}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    className="inline-flex items-center gap-1 text-xs sm:text-[11px] text-[#632D35] hover:underline"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Size Guide</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickViewProduct.sizes.map((size) => {
                    const unavailable = quickViewProduct.unavailableSizes?.includes(size) || false;
                    return (
                    <button
                      key={size}
                      type="button"
                      disabled={unavailable}
                      onClick={() => { setSelectedSize(size); setSizeSelectionError(false); }}
                      aria-pressed={selectedSize === size}
                      className={`min-w-[44px] px-3 py-2 text-sm sm:text-xs border transition-colors disabled:opacity-45 disabled:cursor-not-allowed ${
                        selectedSize === size
                          ? 'bg-[#302820] text-[#F8F5EF] border-[#302820]'
                          : 'bg-white text-[#302820] border-[#D8C8B3] hover:border-[#302820]'
                      }`}
                    >
                      {size}{unavailable ? ' · Unavailable' : ''}
                    </button>
                    );
                  })}
                </div>
                {availableSizes.length === 0 ? (
                  <p role="status" className="mt-2 text-sm text-[#632D35]">No sizes are currently available.</p>
                ) : (sizeSelectionError || (availableSizes.length > 1 && !selectedSize)) && (
                  <p role="alert" className="mt-2 text-sm text-[#632D35]">
                    Please select an available size to continue.
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-7 pt-5 border-t border-[#D8C8B3]/60 space-y-3">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center border border-[#D8C8B3] bg-white h-11">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="px-3 h-full hover:bg-[#EEE6D8] transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3.5 text-sm sm:text-xs font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                    className="px-3 h-full hover:bg-[#EEE6D8] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!quickViewProduct.inStock || !selectedVariant || !sizeIsValid}
                  className="flex-1 h-11 bg-[#632D35] hover:bg-[#4E2229] disabled:bg-[#302820]/30 text-[#F8F5EF] text-sm sm:text-xs uppercase tracking-[0.18em] transition-colors inline-flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                  <span>{!quickViewProduct.inStock ? 'Out of Stock' : !selectedVariant ? 'Select a Color' : !sizeIsValid ? 'Select a Size' : 'Add to Bag'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(quickViewProduct)}
                  aria-label="Toggle wishlist"
                  className={`w-11 h-11 border flex items-center justify-center transition-colors ${
                    wishlisted
                      ? 'bg-[#632D35] border-[#632D35] text-[#F8F5EF]'
                      : 'bg-white border-[#D8C8B3] text-[#302820] hover:border-[#632D35]'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 stroke-[1.5] ${
                      wishlisted ? 'fill-current animate-heart-pop' : ''
                    }`}
                  />
                </button>
              </div>

              <Link
                to={`/product/${quickViewProduct.slug}`}
                onClick={handleClose}
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-[#632D35] hover:text-[#302820] transition-colors pt-1"
              >
                <span>View Full Product Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />
    </div>
  );
};
