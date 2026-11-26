import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const StoryPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Our Story — NARMIRA';
  }, []);

  return (
    <div>
      {/* Editorial Header */}
      <section className="relative min-h-[52vh] flex items-end bg-[#302820] overflow-hidden">
        <img
          src="/images/hero-maheshwar.jpg"
          alt="Maheshwar Heritage"
          className="absolute inset-0 w-full h-full object-cover object-[center_25%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#302820]/85 via-[#302820]/45 to-transparent" />
        <div className="relative z-10 max-w-5xl mx-auto w-full px-5 sm:px-8 py-14 sm:py-20">
          <p className="text-[11px] uppercase tracking-[0.26em] text-[#D8C8B3] mb-3">
            Our Story
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#F8F5EF] font-normal">
            The Heritage of Maheshwar. The Elegance of Narmira.
          </h1>
        </div>
      </section>

      {/* Narrative */}
      <section
        id="heritage"
        className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24 space-y-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-6 space-y-5 text-sm sm:text-base text-[#302820]/80 leading-relaxed font-light">
            <h2 className="font-serif text-3xl text-[#302820] font-normal">
              The Soul of Maheshwar, The Style of Today.
            </h2>
            <p>
              Born from the timeless beauty of Maheshwar, Narmira celebrates the
              art of weaving, the richness of Indian heritage and the elegance
              of modern women.
            </p>
            <p>
              Every piece reflects a story of tradition, craftsmanship and
              thoughtful design — carrying the soul of Maheshwar into the
              wardrobes of today.
            </p>
          </div>
          <div className="md:col-span-6 aspect-[4/5] bg-[#EEE6D8] overflow-hidden">
            <img
              src="/images/story-maheshwar.jpg"
              alt="Maheshwari handloom weaving"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="pt-8 border-t border-[#D8C8B3]/70 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="font-serif italic text-xl text-[#632D35]">
            “This brand carries Indian heritage, but the fashion feels made for
            me today.”
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#632D35] hover:bg-[#4E2229] text-[#F8F5EF] text-xs uppercase tracking-[0.18em] shrink-0"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
};
