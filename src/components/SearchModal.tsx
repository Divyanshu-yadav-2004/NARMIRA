import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { productService } from '../services/api';
import type { Product } from '../types';
import { formatINR, normalizeProductImage } from '../utils/format';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, closeSearch } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSearchOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await productService.search(query);
        if (active) setResults(res);
      } finally {
        if (active) setLoading(false);
      }
    };
    const timer = window.setTimeout(run, 180);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-[#302820]/50 backdrop-blur-[2px]"
        onClick={closeSearch}
      />
      <div className="relative bg-[#F8F5EF] border-b border-[#D8C8B3] shadow-xl animate-fade-in">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center gap-3 border-b border-[#302820]/30 pb-3">
            <Search className="w-5 h-5 text-[#632D35] stroke-[1.5]" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Maheshwari sarees, kurta sets, dupattas..."
              className="w-full bg-transparent text-base sm:text-lg text-[#302820] placeholder-[#302820]/45 focus:outline-none"
            />
            <button
              type="button"
              onClick={closeSearch}
              aria-label="Close search"
              className="p-1.5 text-[#302820] hover:text-[#632D35] transition-colors"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Quick suggestions when empty */}
          {!query.trim() && (
            <div className="mt-5">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#302820]/60 mb-3">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {['Maheshwari Silk', 'Ivory Kurta', 'Festive', 'Dupatta', 'Maroon'].map(
                  (term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="px-3.5 py-1.5 text-xs bg-[#EEE6D8] hover:bg-[#D8C8B3]/60 text-[#302820] transition-colors"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {query.trim() && (
            <div className="mt-6 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <p className="text-xs text-[#302820]/60 py-6">Searching...</p>
              ) : results.length === 0 ? (
                <p className="text-sm text-[#302820]/70 py-6">
                  No pieces found matching “{query}”.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {results.map((product) => {
                    const thumb = normalizeProductImage(
                      product.images[0],
                      product.name,
                      0
                    );
                    return (
                    <Link
                      key={product.id}
                      to={`/product/${product.slug}`}
                      onClick={closeSearch}
                      className="flex items-center gap-4 p-2.5 bg-white/80 hover:bg-white border border-[#D8C8B3]/50 transition-colors"
                    >
                      <img
                        src={thumb.src}
                        alt={thumb.alt}
                        className="w-16 h-20 object-cover bg-[#EEE6D8]"
                        style={{
                          objectPosition: thumb.objectPosition || 'center top',
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.14em] text-[#B59A68]">
                          {product.category}
                        </p>
                        <h4 className="font-serif text-base text-[#302820] truncate">
                          {product.name}
                        </h4>
                        <p className="text-xs font-medium text-[#632D35] mt-0.5">
                          {formatINR(product.price)}
                        </p>
                      </div>
                    </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
