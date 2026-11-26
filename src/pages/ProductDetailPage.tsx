import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronDown,
  Heart,
  Minus,
  Plus,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react';
import { ProductGallery } from '../components/ProductGallery';
import { ProductGrid } from '../components/ProductGrid';
import { SizeGuideModal } from '../components/SizeGuideModal';
import { useStore } from '../context/StoreContext';
import { products as allProducts } from '../data/products';
import { productService } from '../services/api';
import type { Product, Review } from '../types';
import { calculateDiscountPercent, formatINR, getAvailableSizes, getProductVariants } from '../utils/format';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    recordRecentlyViewed,
    recentlyViewedProducts,
  } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sizeSelectionError, setSizeSelectionError] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string>('description');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    Promise.all([
      productService.getBySlug(slug || ''),
      productService.getReviews(slug),
    ])
      .then(([prod, revs]) => {
        if (!mounted) return;
        if (prod) {
          setProduct(prod);
          const availableSizes = getAvailableSizes(prod);
          setSelectedSize(availableSizes.length === 1 ? availableSizes[0] : '');
          setSelectedVariantId(getProductVariants(prod)[0]?.id || '');
          setQuantity(1);
          setSizeSelectionError(false);
          recordRecentlyViewed(prod.id);
          document.title = `${prod.name} — NARMIRA`;
        } else {
          setProduct(null);
        }
        setReviews(revs);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug, recordRecentlyViewed]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 aspect-[3/4] bg-[#EEE6D8]" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-4 w-1/3 bg-[#EEE6D8]" />
            <div className="h-9 w-3/4 bg-[#EEE6D8]" />
            <div className="h-6 w-1/4 bg-[#EEE6D8]" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-3xl text-[#302820] mb-3">
          Piece Not Found
        </h1>
        <p className="text-sm text-[#302820]/70 mb-6">
          The piece you are looking for may have moved or is no longer
          available.
        </p>
        <Link
          to="/shop"
          className="inline-block px-7 py-3 bg-[#632D35] text-[#F8F5EF] text-xs uppercase tracking-[0.18em]"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const discountPct = calculateDiscountPercent(
    product.price,
    product.originalPrice
  );
  const variants = getProductVariants(product);
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) || variants[0];
  const selectedColor = selectedVariant?.color;
  const availableSizes = getAvailableSizes(product);
  const needsSizeSelection = availableSizes.length > 1;
  const sizeIsValid = availableSizes.includes(selectedSize);
  const galleryImages = selectedVariant?.images?.length
    ? selectedVariant.images
    : product.images;

  const handleAddToCart = () => {
    if (!sizeIsValid) {
      setSizeSelectionError(true);
      return;
    }
    addToCart(product, {
      color: selectedColor,
      variantId: selectedVariant?.id,
      size: selectedSize,
      quantity,
    });
  };

  const handleBuyNow = () => {
    if (!sizeIsValid) {
      setSizeSelectionError(true);
      return;
    }
    addToCart(product, {
      color: selectedColor,
      variantId: selectedVariant?.id,
      size: selectedSize,
      quantity,
      silent: true,
    });
    navigate('/checkout');
  };

  const relatedProducts = allProducts
    .filter(
      (p) => p.id !== product.id && p.categorySlug === product.categorySlug
    )
    .slice(0, 4);

  const otherRecentlyViewed = recentlyViewedProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="pb-20 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="text-[11px] uppercase tracking-[0.16em] text-[#302820]/60 mb-6 flex flex-wrap items-center gap-2"
        >
          <Link to="/" className="hover:text-[#632D35]">
            Home
          </Link>
          <span>/</span>
          <Link
            to={`/collections/${product.categorySlug}`}
            className="hover:text-[#632D35]"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-[#302820]">{product.name}</span>
        </nav>

        {/* Main Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          {/* Left: Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery
              key={`${product.id}-${selectedVariant?.id || 'default'}`}
              images={galleryImages}
              productName={product.name}
            />
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.22em] text-[#B59A68] mb-2">
              {product.category}
            </p>

            <h1 className="font-serif text-3xl sm:text-4xl text-[#302820] font-normal leading-tight">
              {product.name}
            </h1>

            {product.rating && (
              <div className="flex items-center gap-2 mt-2.5 text-sm text-[#302820]/75">
                <div className="flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-[#B59A68] text-[#B59A68]" />
                  <span className="ml-1 font-medium">{product.rating}</span>
                </div>
                {product.reviewCount && (
                  <span className="text-[#302820]/55">
                    ({product.reviewCount} reviews)
                  </span>
                )}
              </div>
            )}

            {/* Pricing */}
            <div className="flex items-baseline gap-3 mt-4 pb-5 border-b border-[#D8C8B3]/70">
              <span className="text-2xl font-medium text-[#302820]">
                {formatINR(selectedVariant?.price ?? product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-base text-[#302820]/45 line-through">
                    {formatINR(product.originalPrice)}
                  </span>
                  <span className="px-2 py-0.5 bg-[#632D35]/10 text-[#632D35] text-[11px] uppercase tracking-[0.12em]">
                    Save {discountPct}%
                  </span>
                </>
              )}
              <span className="text-[11px] text-[#302820]/55 ml-auto">
                Incl. of all taxes
              </span>
            </div>

            <p className="text-[15px] text-[#302820]/80 leading-relaxed mt-5">
              {product.shortDescription}
            </p>

            <div className="mt-4 text-sm text-[#302820]/75">
              <span className="uppercase tracking-[0.14em] text-[#302820]/55">
                Fabric:{' '}
              </span>
              <span className="font-medium text-[#302820]">{product.fabric}</span>
            </div>

            {/* Color Selection */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2.5">
                <span className="uppercase tracking-[0.16em] text-[#302820]/70">
                  Color:{' '}
                  <strong className="font-medium text-[#302820]">
                    {selectedColor?.name || 'Unavailable'}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariantId(variant.id)}
                    aria-label={`Color ${variant.color.name}`}
                    aria-pressed={selectedVariant?.id === variant.id}
                    className={`w-7 h-7 rounded-full border transition-all ${
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
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2.5">
                <span className="uppercase tracking-[0.16em] text-[#302820]/70">
                  Size:{' '}
                  <strong className="font-medium text-[#302820]">
                    {selectedSize || 'Choose size'}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#632D35] hover:underline"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Guide</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const unavailable = product.unavailableSizes?.includes(size) || false;
                  return (
                  <button
                    key={size}
                    type="button"
                    disabled={unavailable}
                    onClick={() => { setSelectedSize(size); setSizeSelectionError(false); }}
                    aria-pressed={selectedSize === size}
                    className={`min-w-[48px] px-3.5 py-2.5 text-sm border transition-colors disabled:opacity-45 disabled:cursor-not-allowed ${
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
              ) : (sizeSelectionError || (needsSizeSelection && !selectedSize)) && (
                <p role="alert" className="mt-2 text-sm text-[#632D35]">
                  Please select an available size to continue.
                </p>
              )}
            </div>

            {/* Quantity + Actions */}
            <div className="mt-7 space-y-3">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center border border-[#D8C8B3] bg-white h-12">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="px-3.5 h-full hover:bg-[#EEE6D8] transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-sm font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                    className="px-3.5 h-full hover:bg-[#EEE6D8] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!product.inStock || !selectedVariant || !sizeIsValid}
                  className="flex-1 h-12 bg-[#632D35] hover:bg-[#4E2229] disabled:bg-[#302820]/30 text-[#F8F5EF] text-sm uppercase tracking-[0.18em] transition-colors inline-flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                  <span>{!product.inStock ? 'Out of Stock' : !selectedVariant ? 'Select a Color' : !sizeIsValid ? 'Select a Size' : 'Add to Bag'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  aria-label="Toggle wishlist"
                  className={`w-12 h-12 border flex items-center justify-center transition-colors ${
                    wishlisted
                      ? 'bg-[#632D35] border-[#632D35] text-[#F8F5EF]'
                      : 'bg-white border-[#D8C8B3] text-[#302820] hover:border-[#632D35]'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 stroke-[1.5] ${
                      wishlisted ? 'fill-current' : ''
                    }`}
                  />
                </button>
              </div>

              {product.inStock && (
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!selectedVariant || !sizeIsValid}
                  className="w-full h-12 border border-[#302820] text-[#302820] hover:bg-[#302820] hover:text-[#F8F5EF] disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-[0.18em] transition-colors"
                >
                  Buy Now
                </button>
              )}
            </div>

            {/* Trust Highlights */}
            <div className="mt-6 grid grid-cols-2 gap-3 py-4 border-y border-[#D8C8B3]/60 text-xs text-[#302820]/75">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#B59A68] shrink-0" />
                <span>Complimentary shipping over ₹2,999</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#B59A68] shrink-0" />
                <span>7-day easy returns & exchange</span>
              </div>
            </div>

            {/* Accordion Details */}
            <div className="mt-4 divide-y divide-[#D8C8B3]/70">
              {[
                {
                  id: 'description',
                  title: 'Description',
                  body: (
                    <p className="text-sm text-[#302820]/80 leading-relaxed">
                      {product.description}
                    </p>
                  ),
                },
                {
                  id: 'details',
                  title: 'Product Details & Care',
                  body: (
                    <div className="space-y-2 text-sm text-[#302820]/80">
                      <ul className="list-disc pl-4 space-y-1.5">
                        {product.details.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                      <p className="pt-2 text-[#302820]/70">
                        <strong>Care:</strong> {product.careInstructions}
                      </p>
                    </div>
                  ),
                },
                {
                  id: 'shipping',
                  title: 'Shipping & Returns',
                  body: (
                    <p className="text-sm text-[#302820]/80 leading-relaxed">
                      Orders are dispatched within 2–3 business days across
                      India. Complimentary shipping on orders above ₹2,999.
                      Unused pieces with original tags may be returned or
                      exchanged within 7 days of delivery.
                    </p>
                  ),
                },
              ].map((section) => {
                const isOpen = openAccordion === section.id;
                return (
                  <div key={section.id} className="py-4">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenAccordion(isOpen ? '' : section.id)
                      }
                      className="w-full flex items-center justify-between text-sm uppercase tracking-[0.16em] text-[#302820] font-medium"
                    >
                      <span>{section.title}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && <div className="mt-3">{section.body}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product Reviews */}
        {reviews.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#D8C8B3]/70">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#302820] mb-6">
              Client Reflections
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white border border-[#D8C8B3]/60 p-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star
                          key={idx}
                          className="w-3.5 h-3.5 fill-[#B59A68] text-[#B59A68]"
                        />
                      ))}
                    </div>
                    {rev.isSample && (
                      <span className="text-[10px] uppercase tracking-[0.14em] text-[#302820]/45">
                        Sample Review
                      </span>
                    )}
                  </div>
                  <p className="font-serif italic text-base text-[#302820]">
                    “{rev.comment}”
                  </p>
                  <p className="text-sm text-[#302820]/65 mt-3">
                    {rev.customerName} · {rev.location}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#D8C8B3]/70">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#302820] mb-8">
              You May Also Love
            </h2>
            <ProductGrid products={relatedProducts} columnsDesktop={4} />
          </section>
        )}

        {/* Recently Viewed */}
        {otherRecentlyViewed.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#D8C8B3]/70">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#302820] mb-8">
              Recently Viewed
            </h2>
            <ProductGrid products={otherRecentlyViewed} columnsDesktop={4} />
          </section>
        )}
      </div>

      {/* Sticky Mobile Add to Cart Bar */}
      {product.inStock && (
        <div className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-[#F8F5EF]/95 backdrop-blur-md border-t border-[#D8C8B3] px-4 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-serif text-base text-[#302820] truncate">
              {product.name}
            </p>
            <p className="text-sm font-medium text-[#632D35]">
              {formatINR(selectedVariant?.price ?? product.price)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className="px-5 py-2.5 bg-[#632D35] text-[#F8F5EF] text-xs uppercase tracking-[0.16em] shrink-0"
          >
            Add to Bag
          </button>
        </div>
      )}

      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />
    </div>
  );
};
