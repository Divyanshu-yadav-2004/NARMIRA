import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { AnnouncementBar } from './AnnouncementBar';

const NAV_LINKS = [
  { label: 'Shop', to: '/shop', hasDropdown: true },
  { label: 'Sarees', to: '/collections/sarees' },
  { label: 'Suit Sets', to: '/collections/kurta-sets' },
  { label: 'Kurtis', to: '/collections/kurtis' },
  { label: 'Dupattas', to: '/collections/dupattas' },
  { label: 'New Arrivals', to: '/collections/new-arrivals' },
];

const SHOP_DROPDOWN_ITEMS = [
  { label: 'All Collections', to: '/shop' },
  { label: 'Maheshwari Sarees', to: '/collections/sarees' },
  { label: 'Kurta Sets', to: '/collections/kurta-sets' },
  { label: 'Kurtis', to: '/collections/kurtis' },
  { label: 'Dupattas', to: '/collections/dupattas' },
  { label: 'Dress Materials', to: '/collections/dress-materials' },
  { label: 'Festive Wear', to: '/collections/festive' },
  { label: 'New Arrivals', to: '/collections/new-arrivals' },
  { label: 'Bestsellers', to: '/collections/bestsellers' },
];

export const Header: React.FC = () => {
  const { cartCount, wishlistIds, openCart, openSearch, user } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [badgeBump, setBadgeBump] = useState(false);
  const prevCartCount = useRef(cartCount);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setShopDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (cartCount > prevCartCount.current) {
      setBadgeBump(true);
      const timer = window.setTimeout(() => setBadgeBump(false), 380);
      prevCartCount.current = cartCount;
      return () => window.clearTimeout(timer);
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);

  return (
    <>
      <AnnouncementBar />
      <header
        className={`sticky top-0 z-40 transition-all duration-300 border-b ${
          scrolled
            ? 'bg-[#F8F5EF]/95 backdrop-blur-md border-[#D8C8B3]/70 shadow-[0_4px_20px_rgba(48,40,32,0.06)]'
            : 'bg-[#F8F5EF] border-[#D8C8B3]/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="h-16 sm:h-20 flex items-center justify-between gap-4">
            {/* Mobile Left: Hamburger + Search */}
            <div className="flex items-center gap-1 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                className="p-2 -ml-2 text-[#302820] hover:text-[#632D35] transition-colors"
              >
                <Menu className="w-5 h-5 stroke-[1.5]" />
              </button>
              <button
                type="button"
                onClick={openSearch}
                aria-label="Search products"
                className="p-2 text-[#302820] hover:text-[#632D35] transition-colors"
              >
                <Search className="w-[18px] h-[18px] stroke-[1.5]" />
              </button>
            </div>

            {/* Desktop Left Navigation */}
            <nav
              aria-label="Primary navigation"
              className="hidden lg:flex items-center gap-5 xl:gap-7 flex-1"
            >
              {NAV_LINKS.map((link) =>
                link.hasDropdown ? (
                  <div
                    key={link.to}
                    className="relative"
                    onMouseEnter={() => setShopDropdownOpen(true)}
                    onMouseLeave={() => setShopDropdownOpen(false)}
                  >
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        `inline-flex items-center gap-1 text-[11px] xl:text-xs uppercase tracking-[0.14em] transition-colors whitespace-nowrap py-2 border-b ${
                          isActive
                            ? 'text-[#632D35] border-[#632D35] font-medium'
                            : 'text-[#302820]/85 border-transparent hover:text-[#632D35]'
                        }`
                      }
                    >
                      <span>{link.label}</span>
                      <ChevronDown
                        className={`w-3 h-3 transition-transform duration-200 ${
                          shopDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </NavLink>

                    {/* Smooth Dropdown */}
                    <div
                      className={`absolute left-0 top-full pt-1 w-56 transition-all duration-200 ${
                        shopDropdownOpen
                          ? 'opacity-100 translate-y-0 pointer-events-auto'
                          : 'opacity-0 -translate-y-1 pointer-events-none'
                      }`}
                    >
                      <div className="bg-[#F8F5EF] border border-[#D8C8B3] shadow-xl py-2.5">
                        {SHOP_DROPDOWN_ITEMS.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setShopDropdownOpen(false)}
                            className="block px-5 py-2 text-[11px] uppercase tracking-[0.14em] text-[#302820]/85 hover:text-[#632D35] hover:bg-[#EEE6D8]/60 transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `text-[11px] xl:text-xs uppercase tracking-[0.14em] transition-colors whitespace-nowrap py-1 border-b ${
                        isActive
                          ? 'text-[#632D35] border-[#632D35] font-medium'
                          : 'text-[#302820]/85 border-transparent hover:text-[#632D35]'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                )
              )}
            </nav>

            {/* Center Brand Logo */}
            <div className="flex-shrink-0 text-center">
              <Link
                to="/"
                className="inline-block font-serif text-xl sm:text-[28px] tracking-[0.2em] sm:tracking-[0.26em] text-[#302820] hover:text-[#632D35] transition-colors font-medium"
              >
                NARMIRA
              </Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-5 lg:flex-1">
              <button
                type="button"
                onClick={openSearch}
                aria-label="Search products"
                className="hidden lg:flex items-center gap-1.5 text-[#302820] hover:text-[#632D35] transition-colors p-1.5"
              >
                <Search className="w-[18px] h-[18px] stroke-[1.5]" />
              </button>

              <Link
                to="/account"
                aria-label={user.isSignedIn ? 'Account profile' : 'Sign in'}
                className="hidden sm:flex items-center text-[#302820] hover:text-[#632D35] transition-colors p-1.5"
              >
                <User className="w-[18px] h-[18px] stroke-[1.5]" />
              </Link>

              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className="relative flex items-center text-[#302820] hover:text-[#632D35] transition-colors p-2 sm:p-1.5"
              >
                <Heart className="w-[18px] h-[18px] stroke-[1.5]" />
                {wishlistIds.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#632D35] text-[#F8F5EF] text-[10px] flex items-center justify-center font-medium">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={openCart}
                aria-label="Open shopping bag"
                className="relative flex items-center gap-1.5 text-[#302820] hover:text-[#632D35] transition-colors p-1.5 -mr-1.5 sm:mr-0"
              >
                <ShoppingBag className="w-[19px] h-[19px] stroke-[1.5]" />
                {cartCount > 0 && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#632D35] text-[#F8F5EF] text-[10px] flex items-center justify-center font-medium ${
                      badgeBump ? 'animate-cart-bump' : ''
                    }`}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#302820]/45 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-[84%] max-w-xs bg-[#F8F5EF] shadow-2xl flex flex-col justify-between animate-slide-left">
            <div className="overflow-y-auto">
              <div className="flex items-center justify-between px-6 h-16 border-b border-[#D8C8B3]/60">
                <span className="font-serif text-xl tracking-[0.24em] text-[#302820]">
                  NARMIRA
                </span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="p-2 -mr-2 text-[#302820]"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              <div className="px-6 py-4 border-b border-[#D8C8B3]/40">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    openSearch();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-white border border-[#D8C8B3] text-xs text-[#302820]/70 tracking-wide"
                >
                  <Search className="w-4 h-4 stroke-[1.5]" />
                  <span>Search sarees, kurta sets...</span>
                </button>
              </div>

              <nav className="px-6 py-5 flex flex-col gap-3.5">
                {SHOP_DROPDOWN_ITEMS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `text-sm uppercase tracking-[0.16em] py-1 transition-colors ${
                        isActive ? 'text-[#632D35] font-medium' : 'text-[#302820]'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                <Link
                  to="/our-story"
                  className="text-sm uppercase tracking-[0.16em] py-1 text-[#302820] pt-2 border-t border-[#D8C8B3]/50"
                >
                  Our Story
                </Link>
              </nav>
            </div>

            <div className="px-6 py-5 border-t border-[#D8C8B3]/60 bg-[#EEE6D8]/60 flex flex-col gap-3 shrink-0">
              <Link
                to="/account"
                className="flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-[#302820]"
              >
                <User className="w-4 h-4 stroke-[1.5]" />
                <span>{user.isSignedIn ? user.name : 'Account / Sign In'}</span>
              </Link>
              <Link
                to="/wishlist"
                className="flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-[#302820]"
              >
                <Heart className="w-4 h-4 stroke-[1.5]" />
                <span>Wishlist ({wishlistIds.length})</span>
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
