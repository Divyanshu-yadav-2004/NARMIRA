import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { CollectionInfo } from '../types';

interface CategoryCardProps {
  collection: CollectionInfo;
  aspectClass?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  collection,
  aspectClass = 'aspect-[3/4]',
}) => {
  return (
    <Link
      to={`/collections/${collection.slug}`}
      className={`group block relative overflow-hidden bg-[#EEE6D8] ${aspectClass}`}
    >
      <img
        src={collection.image}
        alt={collection.title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
        style={{ objectPosition: collection.imagePosition || 'center top' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#302820]/78 via-[#302820]/15 to-transparent group-hover:from-[#302820]/85 transition-colors duration-500" />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 flex items-end justify-between gap-2">
        <div className="transition-transform duration-500 ease-out group-hover:-translate-y-1">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#D8C8B3] mb-1">
            {collection.subtitle}
          </p>
          <h3 className="font-serif text-xl sm:text-2xl lg:text-[26px] text-[#F8F5EF] font-normal tracking-wide">
            {collection.title}
          </h3>
        </div>
        <span className="w-9 h-9 border border-[#F8F5EF]/45 flex items-center justify-center text-[#F8F5EF] group-hover:bg-[#632D35] group-hover:border-[#632D35] transition-colors duration-300 shrink-0">
          <ArrowUpRight className="w-4 h-4 stroke-[1.5] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
};
