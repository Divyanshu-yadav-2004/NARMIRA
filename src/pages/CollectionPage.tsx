import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { ProductFilters } from '../components/ProductFilters';
import { ProductGrid } from '../components/ProductGrid';
import { collectionMetaMap } from '../data/collections';
import { productService } from '../services/api';
import type { FilterState, Product, SortOption } from '../types';

const DEFAULT_FILTERS: FilterState = {
  category: 'all',
  priceRange: [0, 20000],
  colors: [],
  sizes: [],
  fabrics: [],
  inStockOnly: false,
};

const QUICK_COLLECTIONS = [
  { label: 'All', to: '/shop', slug: 'all' },
  { label: 'Sarees', to: '/collections/sarees', slug: 'sarees' },
  { label: 'Kurta Sets', to: '/collections/kurta-sets', slug: 'kurta-sets' },
  { label: 'Kurtis', to: '/collections/kurtis', slug: 'kurtis' },
  { label: 'Dupattas', to: '/collections/dupattas', slug: 'dupattas' },
  {
    label: 'Dress Materials',
    to: '/collections/dress-materials',
    slug: 'dress-materials',
  },
  { label: 'Festive Wear', to: '/collections/festive', slug: 'festive' },
  { label: 'New Arrivals', to: '/collections/new-arrivals', slug: 'new-arrivals' },
  { label: 'Bestsellers', to: '/collections/bestsellers', slug: 'bestsellers' },
];

const PAGE_SIZE = 9;

export const CollectionPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const activeSlug = slug || 'all';

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    category:
      activeSlug !== 'all' &&
      activeSlug !== 'new-arrivals' &&
      activeSlug !== 'bestsellers'
        ? activeSlug
        : 'all',
  });

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setFilters((prev) => ({
      ...prev,
      category:
        activeSlug !== 'all' &&
        activeSlug !== 'new-arrivals' &&
        activeSlug !== 'bestsellers'
          ? activeSlug
          : 'all',
    }));
  }, [activeSlug]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    productService
      .getAll()
      .then((data) => {
        if (mounted) {
          setAllProducts(data);
          setError(null);
        }
      })
      .catch(() => {
        if (mounted) setError('Unable to load collection. Please refresh.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const meta = collectionMetaMap[activeSlug] || collectionMetaMap.all;

  useEffect(() => {
    document.title = `${meta.title} — NARMIRA`;
  }, [meta.title]);

  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    if (activeSlug === 'new-arrivals') {
      list = list.filter((p) => p.isNewArrival);
    } else if (activeSlug === 'bestsellers') {
      list = list.filter((p) => p.isBestseller);
    }

    if (filters.category !== 'all') {
      list = list.filter((p) => p.categorySlug === filters.category);
    }

    list = list.filter(
      (p) =>
        p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    if (filters.colors.length > 0) {
      list = list.filter((p) =>
        p.colors.some((c) => filters.colors.includes(c.name))
      );
    }

    if (filters.sizes.length > 0) {
      list = list.filter((p) =>
        p.sizes.some((s) => filters.sizes.includes(s))
      );
    }

    if (filters.fabrics.length > 0) {
      list = list.filter((p) => filters.fabrics.includes(p.fabric));
    }

    if (filters.inStockOnly) {
      list = list.filter((p) => p.inStock);
    }

    switch (sortBy) {
      case 'newest':
        list.sort(
          (a, b) =>
            Number(Boolean(b.isNewArrival)) - Number(Boolean(a.isNewArrival))
        );
        break;
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'bestselling':
        list.sort(
          (a, b) =>
            Number(Boolean(b.isBestseller)) - Number(Boolean(a.isBestseller))
        );
        break;
      default:
        break;
    }

    return list;
  }, [allProducts, activeSlug, filters, sortBy]);

  const displayedProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  const hasMore = displayedProducts.length < filteredProducts.length;

  const resetFilters = () => {
    setFilters({
      ...DEFAULT_FILTERS,
      category:
        activeSlug !== 'all' &&
        activeSlug !== 'new-arrivals' &&
        activeSlug !== 'bestsellers'
          ? activeSlug
          : 'all',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="text-[11px] uppercase tracking-[0.16em] text-[#302820]/60 mb-6 flex items-center gap-2"
      >
        <Link to="/" className="hover:text-[#632D35]">
          Home
        </Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-[#632D35]">
          Shop
        </Link>
        {activeSlug !== 'all' && (
          <>
            <span>/</span>
            <span className="text-[#302820]">{meta.title}</span>
          </>
        )}
      </nav>

      {/* Collection Header */}
      <div className="pb-6 border-b border-[#D8C8B3]/70 mb-6">
        <h1 className="font-serif text-3xl sm:text-5xl text-[#302820] font-normal">
          {meta.title}
        </h1>
        <p className="text-sm text-[#302820]/75 mt-3 max-w-2xl leading-relaxed">
          {meta.description}
        </p>

        {/* Quick Collection Switcher */}
        <div className="mt-6 -mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-2 overflow-x-auto pb-1">
          {QUICK_COLLECTIONS.map((col) => {
            const isActive = activeSlug === col.slug;
            return (
              <Link
                key={col.slug}
                to={col.to}
                className={`px-3.5 py-1.5 text-[11px] uppercase tracking-[0.14em] whitespace-nowrap border transition-colors ${
                  isActive
                    ? 'bg-[#632D35] text-[#F8F5EF] border-[#632D35]'
                    : 'bg-white text-[#302820]/80 border-[#D8C8B3] hover:border-[#632D35]'
                }`}
              >
                {col.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2 border border-[#D8C8B3] bg-white text-xs uppercase tracking-[0.14em]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
          <p className="text-xs text-[#302820]/70">
            Showing {displayedProducts.length} of {filteredProducts.length}{' '}
            {filteredProducts.length === 1 ? 'Piece' : 'Pieces'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <label
            htmlFor="sort-select"
            className="hidden sm:inline text-[11px] uppercase tracking-[0.14em] text-[#302820]/65"
          >
            Sort By
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3.5 py-2 bg-white border border-[#D8C8B3] text-xs text-[#302820] focus:outline-none focus:border-[#632D35]"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="bestselling">Bestselling</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-10 lg:gap-12">
        <ProductFilters
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
          showCategoryFilter={activeSlug === 'all'}
          mobileOpen={mobileFiltersOpen}
          onCloseMobile={() => setMobileFiltersOpen(false)}
        />

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="animate-pulse">
                  <div className="aspect-[3/4] bg-[#EEE6D8] mb-3" />
                  <div className="h-3 w-1/3 bg-[#EEE6D8] mb-2" />
                  <div className="h-4 w-2/3 bg-[#EEE6D8]" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="py-16 text-center bg-white border border-[#D8C8B3]">
              <p className="text-sm text-[#632D35]">{error}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 px-6 text-center bg-white border border-[#D8C8B3]/70">
              <h2 className="font-serif text-2xl text-[#302820] mb-2">
                No Matching Pieces
              </h2>
              <p className="text-xs text-[#302820]/70 mb-6">
                Try adjusting or clearing your selected filters to explore more
                of our collection.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-6 py-2.5 bg-[#632D35] text-[#F8F5EF] text-xs uppercase tracking-[0.16em]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <ProductGrid
                products={displayedProducts}
                columnsDesktop={3}
                showBestsellerBadge
              />

              {hasMore && (
                <div className="mt-12 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="px-8 py-3.5 border border-[#302820] text-[#302820] hover:bg-[#302820] hover:text-[#F8F5EF] text-xs uppercase tracking-[0.18em] transition-colors"
                  >
                    Load More Pieces
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
