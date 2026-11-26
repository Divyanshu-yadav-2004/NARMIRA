import React from 'react';
import { X } from 'lucide-react';
import { collections } from '../data/collections';
import { allColors, allFabrics, allSizes } from '../data/products';
import type { FilterState } from '../types';
import { formatINR } from '../utils/format';

interface ProductFiltersProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
  showCategoryFilter?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const PRICE_RANGES: Array<{ label: string; range: [number, number] }> = [
  { label: 'All Prices', range: [0, 20000] },
  { label: 'Under ₹4,000', range: [0, 4000] },
  { label: '₹4,000 – ₹7,500', range: [4000, 7500] },
  { label: 'Above ₹7,500', range: [7500, 20000] },
];

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onChange,
  onReset,
  showCategoryFilter = true,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const toggleArrayValue = (
    key: 'colors' | 'sizes' | 'fabrics',
    value: string
  ) => {
    const current = filters[key];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  const content = (
    <div className="space-y-7 text-xs text-[#302820]">
      <div className="flex items-center justify-between pb-3 border-b border-[#D8C8B3]/70">
        <span className="uppercase tracking-[0.18em] font-medium">
          Refine By
        </span>
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] text-[#632D35] hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* Category */}
      {showCategoryFilter && (
        <div>
          <h3 className="uppercase tracking-[0.16em] text-[11px] font-medium text-[#302820] mb-3">
            Category
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={filters.category === 'all'}
                onChange={() => onChange({ ...filters, category: 'all' })}
                className="accent-[#632D35]"
              />
              <span>All Collections</span>
            </label>
            {collections.map((col) => (
              <label
                key={col.slug}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === col.slug}
                  onChange={() => onChange({ ...filters, category: col.slug })}
                  className="accent-[#632D35]"
                />
                <span>{col.title}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      <div>
        <h3 className="uppercase tracking-[0.16em] text-[11px] font-medium text-[#302820] mb-3">
          Price ({formatINR(filters.priceRange[0])} –{' '}
          {filters.priceRange[1] >= 20000
            ? '₹20,000+'
            : formatINR(filters.priceRange[1])}
          )
        </h3>
        <div className="space-y-2">
          {PRICE_RANGES.map((item) => {
            const active =
              filters.priceRange[0] === item.range[0] &&
              filters.priceRange[1] === item.range[1];
            return (
              <label
                key={item.label}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <input
                  type="radio"
                  name="priceRange"
                  checked={active}
                  onChange={() =>
                    onChange({ ...filters, priceRange: item.range })
                  }
                  className="accent-[#632D35]"
                />
                <span>{item.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Color */}
      <div>
        <h3 className="uppercase tracking-[0.16em] text-[11px] font-medium text-[#302820] mb-3">
          Color
        </h3>
        <div className="flex flex-wrap gap-2">
          {allColors.map((color) => {
            const selected = filters.colors.includes(color.name);
            return (
              <button
                key={color.name}
                type="button"
                onClick={() => toggleArrayValue('colors', color.name)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border text-[11px] transition-colors ${
                  selected
                    ? 'border-[#632D35] bg-[#632D35]/10 text-[#632D35]'
                    : 'border-[#D8C8B3] bg-white hover:border-[#302820]'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-[#D8C8B3]"
                  style={{ backgroundColor: color.hex }}
                />
                <span>{color.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Size */}
      <div>
        <h3 className="uppercase tracking-[0.16em] text-[11px] font-medium text-[#302820] mb-3">
          Size
        </h3>
        <div className="flex flex-wrap gap-2">
          {allSizes.map((size) => {
            const selected = filters.sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleArrayValue('sizes', size)}
                className={`px-3 py-1.5 border text-[11px] transition-colors ${
                  selected
                    ? 'border-[#632D35] bg-[#632D35] text-[#F8F5EF]'
                    : 'border-[#D8C8B3] bg-white hover:border-[#302820]'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fabric */}
      <div>
        <h3 className="uppercase tracking-[0.16em] text-[11px] font-medium text-[#302820] mb-3">
          Fabric
        </h3>
        <div className="space-y-2">
          {allFabrics.map((fabric) => (
            <label
              key={fabric}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.fabrics.includes(fabric)}
                onChange={() => toggleArrayValue('fabrics', fabric)}
                className="accent-[#632D35]"
              />
              <span>{fabric}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="uppercase tracking-[0.16em] text-[11px] font-medium text-[#302820] mb-3">
          Availability
        </h3>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) =>
              onChange({ ...filters, inStockOnly: e.target.checked })
            }
            className="accent-[#632D35]"
          />
          <span>In Stock Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">{content}</aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#302820]/45 backdrop-blur-[2px]"
            onClick={onCloseMobile}
          />
          <aside className="fixed inset-y-0 left-0 w-[85%] max-w-xs bg-[#F8F5EF] shadow-2xl flex flex-col animate-slide-left">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D8C8B3]">
              <span className="font-serif text-xl text-[#302820]">Filters</span>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close filters"
                className="p-1.5 text-[#302820]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{content}</div>
            <div className="p-4 border-t border-[#D8C8B3] bg-white">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full py-3 bg-[#632D35] text-[#F8F5EF] text-xs uppercase tracking-[0.18em]"
              >
                Show Results
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
