import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative w-full min-h-[76vh] sm:min-h-[86vh] flex items-end sm:items-center overflow-hidden bg-[#302820]">
      {/* Background Editorial Photography with Subtle Reveal */}
      <img
        src="/images/hero-maheshwar.jpg"
        alt="Woman in an ivory and deep maroon Maheshwari silk saree at historic Maheshwar Fort"
        className="absolute inset-0 w-full h-full object-cover object-[center_20%] animate-hero-reveal"
      />

      {/* Subtle Editorial Scrims for Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#302820]/85 via-[#302820]/40 to-[#302820]/15 sm:bg-gradient-to-r sm:from-[#302820]/82 sm:via-[#302820]/45 sm:to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-8 lg:px-10 py-14 sm:py-20">
        <div className="max-w-xl">
          <p
            className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-[#D8C8B3] mb-4 animate-fade-in"
            style={{ animationDelay: '80ms' }}
          >
            CRAFTED WITH HERITAGE
          </p>

          <h1
            className="font-serif text-[34px] sm:text-5xl lg:text-6xl text-[#F8F5EF] leading-[1.08] font-normal tracking-tight animate-fade-in"
            style={{ animationDelay: '180ms' }}
          >
            A Legacy Woven Into Every Thread.
          </h1>

          <p
            className="font-serif italic text-lg sm:text-xl text-[#D8C8B3] mt-4 animate-fade-in"
            style={{ animationDelay: '280ms' }}
          >
            The Soul of Maheshwar, The Style of Today.
          </p>

          <p
            className="text-sm sm:text-base text-[#F8F5EF]/85 mt-4 leading-relaxed max-w-md font-light animate-fade-in"
            style={{ animationDelay: '360ms' }}
          >
            Discover timeless Indian elegance, thoughtfully woven for the woman
            of today.
          </p>

          <div
            className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 animate-fade-in"
            style={{ animationDelay: '460ms' }}
          >
            <Link
              to="/shop"
              className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#632D35] hover:bg-[#4E2229] active:scale-[0.99] text-[#F8F5EF] text-xs uppercase tracking-[0.2em] transition-all"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              to="/our-story"
              className="inline-flex items-center justify-center px-7 py-3.5 border border-[#F8F5EF]/60 hover:border-[#F8F5EF] hover:bg-[#F8F5EF]/10 active:scale-[0.99] text-[#F8F5EF] text-xs uppercase tracking-[0.2em] transition-all"
            >
              Discover Our Story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
