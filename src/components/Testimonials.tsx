import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { sampleReviews } from '../data/reviews';

export const Testimonials: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-10 bg-[#F8F5EF]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#B59A68] mb-2.5">
            Client Notes
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#302820] font-normal">
            Stories of Elegance
          </h2>
          <p className="text-xs text-[#302820]/60 mt-2">
            Illustrative sample testimonials — ready to be connected to verified
            customer reviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {sampleReviews.map((review) => (
            <article
              key={review.id}
              className="bg-white border border-[#D8C8B3]/60 p-7 sm:p-8 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div
                    className="flex items-center gap-1"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {Array.from({ length: review.rating }).map((_, idx) => (
                      <Star
                        key={idx}
                        className="w-3.5 h-3.5 fill-[#B59A68] text-[#B59A68]"
                      />
                    ))}
                  </div>
                  {review.isSample && (
                    <span className="text-[10px] uppercase tracking-[0.14em] text-[#302820]/45">
                      Sample
                    </span>
                  )}
                </div>

                <p className="font-serif text-lg text-[#302820] leading-relaxed italic">
                  “{review.comment}”
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-[#D8C8B3]/50">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#302820]">
                  {review.customerName} · {review.location}
                </p>
                <Link
                  to={`/product/${review.productSlug}`}
                  className="text-[11px] text-[#632D35] hover:underline mt-1 inline-block"
                >
                  Purchased: {review.productName}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
