import React from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../config/siteConfig';

export const AnnouncementBar: React.FC = () => {
  if (!siteConfig.announcement.enabled) return null;

  return (
    <div className="bg-[#302820] text-[#F8F5EF] text-[11px] sm:text-xs tracking-[0.18em] uppercase py-2.5 px-4 text-center">
      <Link
        to={siteConfig.announcement.link}
        className="hover:text-[#D8C8B3] transition-colors inline-block"
      >
        {siteConfig.announcement.text}
      </Link>
    </div>
  );
};
