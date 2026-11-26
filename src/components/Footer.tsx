import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { FacebookIcon, InstagramIcon } from './SocialIcons';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#302820] text-[#F8F5EF] border-t border-[#B59A68]/30 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 lg:pr-4">
            <Link
              to="/"
              className="font-serif text-3xl tracking-[0.25em] text-[#F8F5EF] inline-block"
            >
              {siteConfig.brandName}
            </Link>
            <p className="font-serif italic text-lg text-[#EEE6D8] mt-3">
              “{siteConfig.tagline}”
            </p>
            <p className="text-[15px] text-[#D8C8B3]/90 leading-[1.7] mt-4 max-w-sm">
              Timeless Indian ethnic fashion inspired by the weaving heritage of
              Maheshwar, designed for the contemporary wardrobe.
            </p>

            {/* Social Links — 44px touch targets */}
            <div className="flex items-center gap-3.5 mt-6">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="NARMIRA on Instagram"
                className="w-11 h-11 border border-[#D8C8B3]/35 flex items-center justify-center text-[#EEE6D8] hover:border-[#B59A68] hover:text-[#F8F5EF] hover:bg-[#632D35]/40 transition-colors"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="NARMIRA on Facebook"
                className="w-11 h-11 border border-[#D8C8B3]/35 flex items-center justify-center text-[#EEE6D8] hover:border-[#B59A68] hover:text-[#F8F5EF] hover:bg-[#632D35]/40 transition-colors"
              >
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a
                href={siteConfig.social.whatsapp}
                target="_blank"
                rel="noreferrer"
                aria-label="NARMIRA on WhatsApp"
                className="w-11 h-11 border border-[#D8C8B3]/35 flex items-center justify-center text-[#EEE6D8] hover:border-[#B59A68] hover:text-[#F8F5EF] hover:bg-[#632D35]/40 transition-colors"
              >
                <MessageCircle className="w-5 h-5 stroke-[1.5]" />
              </a>
              <a
                href={`mailto:${siteConfig.social.email}`}
                aria-label="Email NARMIRA"
                className="w-11 h-11 border border-[#D8C8B3]/35 flex items-center justify-center text-[#EEE6D8] hover:border-[#B59A68] hover:text-[#F8F5EF] hover:bg-[#632D35]/40 transition-colors"
              >
                <Mail className="w-5 h-5 stroke-[1.5]" />
              </a>
            </div>
          </div>

          {/* SHOP */}
          <div>
            <h3 className="text-sm sm:text-[15px] uppercase tracking-[0.18em] text-[#B59A68] font-medium mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5 text-[15px] md:text-base text-[#EEE6D8]/90">
              {siteConfig.footer.shopLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="inline-block py-1 hover:text-[#F8F5EF] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CUSTOMER CARE */}
          <div>
            <h3 className="text-sm sm:text-[15px] uppercase tracking-[0.18em] text-[#B59A68] font-medium mb-4">
              Customer Care
            </h3>
            <ul className="space-y-2.5 text-[15px] md:text-base text-[#EEE6D8]/90">
              {siteConfig.footer.customerCareLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="inline-block py-1 hover:text-[#F8F5EF] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ABOUT */}
          <div>
            <h3 className="text-sm sm:text-[15px] uppercase tracking-[0.18em] text-[#B59A68] font-medium mb-4">
              About
            </h3>
            <ul className="space-y-2.5 text-[15px] md:text-base text-[#EEE6D8]/90">
              {siteConfig.footer.aboutLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="inline-block py-1 hover:text-[#F8F5EF] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* LEGAL */}
          <div>
            <h3 className="text-sm sm:text-[15px] uppercase tracking-[0.18em] text-[#B59A68] font-medium mb-4">
              Legal
            </h3>
            <ul className="space-y-2.5 text-[15px] md:text-base text-[#EEE6D8]/90">
              {siteConfig.footer.legalLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="inline-block py-1 hover:text-[#F8F5EF] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-7 border-t border-[#D8C8B3]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-[#D8C8B3]/80 text-center sm:text-left">
          <p>{siteConfig.footer.copyright}</p>
          <p className="tracking-wide">
            Prices inclusive of applicable taxes · INR (₹)
          </p>
        </div>
      </div>
    </footer>
  );
};
