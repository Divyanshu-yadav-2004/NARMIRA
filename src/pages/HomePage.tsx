import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Feather, Sparkles } from 'lucide-react';
import { CategoryCard } from '../components/CategoryCard';
import { Hero } from '../components/Hero';
import { Newsletter } from '../components/Newsletter';
import { ProductCard } from '../components/ProductCard';
import { ProductGrid } from '../components/ProductGrid';
import { Reveal } from '../components/Reveal';
import { InstagramIcon } from '../components/SocialIcons';
import { Testimonials } from '../components/Testimonials';
import { siteConfig } from '../config/siteConfig';
import { homepageCollections } from '../data/collections';
import { products } from '../data/products';

const EDITORIAL_GALLERY = [
  {
    src: '/images/hero-maheshwar.jpg',
    alt: 'NARMIRA Maheshwari Silk Saree editorial look',
    pos: 'center 22%',
  },
  {
    src: '/images/prod-kurta-set-1.jpg',
    alt: 'NARMIRA Ivory Handwoven Kurta Set',
    pos: 'center top',
  },
  {
    src: '/images/story-maheshwar.jpg',
    alt: 'Maheshwari handloom threads and zari border',
    pos: 'center center',
  },
  {
    src: '/images/prod-kurta-set-2.jpg',
    alt: 'NARMIRA Royal Maroon Festive Suit',
    pos: 'center top',
  },
  {
    src: '/images/featured-tradition.jpg',
    alt: 'NARMIRA sunlit heritage courtyard silhouette',
    pos: 'center 20%',
  },
  {
    src: '/images/prod-dupatta-2.jpg',
    alt: 'NARMIRA Zari Tissue Dupatta styling',
    pos: 'center top',
  },
];

const CRAFTSMANSHIP_IMAGES = [
  {
    src: '/images/story-maheshwar.jpg',
    alt: 'Traditional wooden handloom in Maheshwar',
    pos: 'center center',
  },
  {
    src: '/images/prod-dupatta-2.jpg',
    alt: 'Fine muted gold zari border detailing',
    pos: 'center 60%',
  },
  {
    src: '/images/featured-tradition.jpg',
    alt: 'Contemporary Maheshwari silhouette in motion',
    pos: 'center 20%',
  },
];

const PILLAR_ICONS = [Compass, Feather, Sparkles];

export const HomePage: React.FC = () => {
  useEffect(() => {
    document.title = 'NARMIRA — The Soul of Maheshwar, The Style of Today';
  }, []);

  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 4);
  const bestsellers = products.filter((p) => p.isBestseller).slice(0, 5);
  const spotlightBestseller = bestsellers[0];
  const secondaryBestsellers = bestsellers.slice(1, 5);

  return (
    <div>
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Shop By Collection — Editorial Asymmetric Layout */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#B59A68] mb-2">
                Curated Categories
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] text-[#302820] font-normal">
                Explore Our Collections
              </h2>
            </div>
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#632D35] hover:text-[#302820] transition-colors"
            >
              <span>View All Collections</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>

        {/* Top 2 Signature Editorial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {homepageCollections.slice(0, 2).map((collection, idx) => (
            <Reveal key={collection.slug} delayMs={idx * 90}>
              <CategoryCard
                collection={collection}
                aspectClass="aspect-[4/5] sm:aspect-[5/6]"
              />
            </Reveal>
          ))}
        </div>

        {/* Bottom 4 Curated Category Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {homepageCollections.slice(2, 6).map((collection, idx) => (
            <Reveal key={collection.slug} delayMs={idx * 80}>
              <CategoryCard collection={collection} aspectClass="aspect-[3/4]" />
            </Reveal>
          ))}
        </div>
      </section>

      {/* 3. New Arrivals */}
      <section className="py-16 sm:py-22 px-4 sm:px-6 lg:px-10 bg-white border-y border-[#D8C8B3]/50">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#632D35] mb-2">
                  Just In
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#302820] font-normal">
                  New Arrivals
                </h2>
                <p className="text-sm text-[#302820]/70 mt-2 max-w-lg">
                  Discover pieces that celebrate tradition with a contemporary
                  soul.
                </p>
              </div>
              <Link
                to="/collections/new-arrivals"
                className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#632D35] hover:text-[#302820] transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>

          <ProductGrid products={newArrivals} columnsDesktop={4} />
        </div>
      </section>

      {/* 4. Brand Story Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <Reveal className="lg:col-span-6">
            <div className="relative aspect-[4/5] bg-[#EEE6D8] overflow-hidden">
              <img
                src="/images/story-maheshwar.jpg"
                alt="Traditional Maheshwari handloom weaving with warm ivory and maroon threads"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
              />
            </div>
          </Reveal>

          <Reveal delayMs={120} className="lg:col-span-6 lg:pl-6">
            <p className="text-[11px] uppercase tracking-[0.26em] text-[#B59A68] mb-3">
              Our Heritage
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] text-[#302820] leading-[1.15] font-normal">
              The Heritage of Maheshwar. The Elegance of Narmira.
            </h2>

            <div className="mt-6 space-y-4 text-sm sm:text-base text-[#302820]/80 leading-relaxed font-light">
              <p>
                Born from the timeless beauty of Maheshwar, Narmira celebrates
                the art of weaving, the richness of Indian heritage and the
                elegance of modern women.
              </p>
              <p>
                Every piece reflects a story of tradition, craftsmanship and
                thoughtful design — carrying the soul of Maheshwar into the
                wardrobes of today.
              </p>
            </div>

            <div className="mt-8">
              <Link
                to="/our-story"
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#632D35] hover:bg-[#4E2229] text-[#F8F5EF] text-xs uppercase tracking-[0.18em] transition-colors"
              >
                <span>Discover Our Story</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5. Bestsellers — Distinct Editorial Spotlight Layout */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-10 bg-[#EEE6D8]/55 border-y border-[#D8C8B3]/60">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#632D35] mb-2">
                  Signature Silhouettes
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#302820] font-normal">
                  Most Loved by You
                </h2>
              </div>
              <Link
                to="/collections/bestsellers"
                className="group inline-flex items-center gap-2 px-5 py-2.5 border border-[#302820]/40 hover:border-[#632D35] text-xs uppercase tracking-[0.16em] text-[#302820] hover:text-[#632D35] transition-colors self-start sm:self-auto"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Editorial Bestseller Spotlight */}
            {spotlightBestseller && (
              <Reveal className="lg:col-span-5 bg-white border border-[#D8C8B3]/70 p-5 sm:p-6">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#B59A68] mb-3">
                  Editor’s Spotlight
                </p>
                <ProductCard
                  product={spotlightBestseller}
                  showBestsellerBadge
                />
                <p className="text-xs text-[#302820]/70 leading-relaxed mt-4 pt-4 border-t border-[#D8C8B3]/50">
                  {spotlightBestseller.shortDescription}
                </p>
              </Reveal>
            )}

            {/* Curated 2x2 Grid */}
            <div className="lg:col-span-7 grid grid-cols-2 gap-4 sm:gap-6">
              {secondaryBestsellers.map((product, idx) => (
                <Reveal key={product.id} delayMs={idx * 80}>
                  <ProductCard product={product} showBestsellerBadge />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Featured Collection Banner */}
      <section className="relative w-full min-h-[62vh] sm:min-h-[70vh] flex items-center overflow-hidden bg-[#302820]">
        <img
          src="/images/featured-tradition.jpg"
          alt="Contemporary woman in antique cream Maheshwari kurta set in sunlit courtyard"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover object-[center_20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#302820]/84 via-[#302820]/45 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-8 lg:px-10 py-16">
          <Reveal className="max-w-lg">
            <p className="text-[11px] uppercase tracking-[0.26em] text-[#D8C8B3] mb-3">
              Featured Edit
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl text-[#F8F5EF] font-normal leading-tight">
              Tradition, Reimagined.
            </h2>
            <p className="text-sm sm:text-base text-[#F8F5EF]/85 mt-4 leading-relaxed font-light">
              Classic Indian craftsmanship meets silhouettes designed for the
              modern woman.
            </p>
            <div className="mt-8">
              <Link
                to="/collections/festive"
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#F8F5EF] hover:bg-[#EEE6D8] text-[#302820] text-xs uppercase tracking-[0.2em] transition-colors"
              >
                <span>Shop The Collection</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 7. Craftsmanship Section — Textile Details & Meaning */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-10 bg-white border-b border-[#D8C8B3]/50">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center max-w-xl mx-auto mb-12 sm:mb-14">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#B59A68] mb-2.5">
                Philosophy
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#302820] font-normal">
                Woven With Meaning
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {siteConfig.craftsmanshipPillars.map((pillar, idx) => {
              const Icon = PILLAR_ICONS[idx % PILLAR_ICONS.length];
              const media = CRAFTSMANSHIP_IMAGES[idx % CRAFTSMANSHIP_IMAGES.length];
              return (
                <Reveal
                  key={pillar.id}
                  delayMs={idx * 90}
                  className="bg-[#F8F5EF] border border-[#D8C8B3]/60 overflow-hidden group"
                >
                  <div className="aspect-[16/10] bg-[#EEE6D8] overflow-hidden">
                    <img
                      src={media.src}
                      alt={media.alt}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ objectPosition: media.pos }}
                    />
                  </div>
                  <div className="p-7 text-center">
                    <div className="w-10 h-10 mx-auto mb-4 border border-[#B59A68]/60 flex items-center justify-center text-[#632D35] bg-white">
                      <Icon className="w-4 h-4 stroke-[1.4]" />
                    </div>
                    <h3 className="font-serif text-2xl text-[#302820] font-normal mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#302820]/75 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Customer Reviews */}
      <Testimonials />

      {/* 9. Instagram / Editorial Lookbook Gallery */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-10 bg-white border-t border-[#D8C8B3]/50">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#B59A68] mb-2">
                  Lookbook Gallery
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#302820] font-normal">
                  Elegance, Worn Your Way
                </h2>
              </div>
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#632D35] hover:text-[#302820] transition-colors"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>Follow {siteConfig.social.handle}</span>
              </a>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {EDITORIAL_GALLERY.map((item, idx) => (
              <a
                key={idx}
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-[3/4] overflow-hidden bg-[#EEE6D8]"
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ objectPosition: item.pos }}
                />
                <div className="absolute inset-0 bg-[#302820]/0 group-hover:bg-[#302820]/25 transition-colors flex items-center justify-center">
                  <InstagramIcon className="w-5 h-5 text-[#F8F5EF] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Newsletter */}
      <Newsletter />
    </div>
  );
};
