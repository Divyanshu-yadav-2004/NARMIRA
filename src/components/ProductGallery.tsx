import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import type { ProductImageInput } from '../types';
import { normalizeProductImages } from '../utils/format';

interface ProductGalleryProps {
  images: ProductImageInput[];
  productName: string;
  compactMobile?: boolean;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
  compactMobile = false,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const touchStartX = useRef<number | null>(null);

  const safeImages = normalizeProductImages(images, productName);
  const activeImage = safeImages[activeIndex] || safeImages[0];

  const prev = () =>
    setActiveIndex((i) => (i - 1 + safeImages.length) % safeImages.length);
  const next = () => setActiveIndex((i) => (i + 1) % safeImages.length);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x, y });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) prev();
      else next();
    }
    touchStartX.current = null;
  };

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3.5 sm:gap-4">
      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-visible sm:w-20 shrink-0">
          {safeImages.map((img, idx) => (
            <button
              key={`${img.src}-${idx}`}
              type="button"
              onClick={() => {
                setActiveIndex(idx);
                setIsZoomed(false);
              }}
              className={`w-16 sm:w-20 aspect-[3/4] shrink-0 overflow-hidden border transition-all ${
                activeIndex === idx
                  ? 'border-[#632D35] opacity-100'
                  : 'border-[#D8C8B3]/60 opacity-65 hover:opacity-100'
              }`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover"
                style={{ objectPosition: img.objectPosition || 'center top' }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div
        className={`relative flex-1 bg-[#EEE6D8] overflow-hidden select-none ${
          compactMobile ? 'aspect-[4/5] sm:aspect-[3/4]' : 'aspect-[3/4]'
        }`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsZoomed(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={activeImage.src}
          alt={activeImage.alt}
          onClick={() => setIsZoomed((z) => !z)}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isZoomed ? 'scale-175 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
          }`}
          style={{
            objectPosition: activeImage.objectPosition || 'center top',
            transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
          }}
        />

        {/* Zoom Toggle */}
        <button
          type="button"
          onClick={() => setIsZoomed((z) => !z)}
          aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
          className="absolute bottom-3.5 right-3.5 w-9 h-9 bg-[#F8F5EF]/90 hover:bg-white text-[#302820] flex items-center justify-center border border-[#D8C8B3] transition-colors"
        >
          {isZoomed ? (
            <ZoomOut className="w-4 h-4 stroke-[1.5]" />
          ) : (
            <ZoomIn className="w-4 h-4 stroke-[1.5]" />
          )}
        </button>

        {/* Mobile / Gallery Arrows */}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#F8F5EF]/85 hover:bg-white text-[#302820] flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#F8F5EF]/85 hover:bg-white text-[#302820] flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
