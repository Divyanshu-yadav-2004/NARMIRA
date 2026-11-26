import React from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { QuickViewModal } from './components/QuickViewModal';
import { SearchModal } from './components/SearchModal';
import { StoreProvider } from './context/StoreContext';
import { ToastProvider } from './context/ToastContext';
import { AccountPage } from './pages/AccountPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CollectionPage } from './pages/CollectionPage';
import { HomePage } from './pages/HomePage';
import { InfoPage } from './pages/InfoPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { StoryPage } from './pages/StoryPage';
import { WishlistPage } from './pages/WishlistPage';
import { AdminApp } from './admin/AdminApp';

const AppShell: React.FC = () => {
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) return <AdminApp />;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#302820]">
      <Header />
      <main key={location.pathname} className="flex-1 animate-page-enter">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<CollectionPage />} />
          <Route path="/collections/:slug" element={<CollectionPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/our-story" element={<StoryPage />} />
          <Route path="/contact" element={<InfoPage pageKey="contact" />} />
          <Route path="/faq" element={<InfoPage pageKey="faq" />} />
          <Route path="/shipping" element={<InfoPage pageKey="shipping" />} />
          <Route path="/returns" element={<InfoPage pageKey="returns" />} />
          <Route
            path="/order-tracking"
            element={<InfoPage pageKey="order-tracking" />}
          />
          <Route
            path="/privacy-policy"
            element={<InfoPage pageKey="privacy" />}
          />
          <Route path="/terms" element={<InfoPage pageKey="terms" />} />
          <Route
            path="/refund-policy"
            element={<InfoPage pageKey="refund" />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <SearchModal />
      <QuickViewModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <StoreProvider>
          <AppShell />
        </StoreProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
