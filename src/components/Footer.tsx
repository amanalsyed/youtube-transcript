import React from 'react';
import { Shield, FileText, Mail } from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
  onNavigate?: (page: 'home' | 'privacy' | 'terms' | 'contact') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (page: 'home' | 'privacy' | 'terms' | 'contact', e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(page);
    }
  };

  return (
    <footer className="border-t border-zinc-200/60 bg-white py-12 text-zinc-600 text-xs sm:text-sm font-['Poppins',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div
            onClick={(e) => handleNav('home', e)}
            className="cursor-pointer group"
            role="button"
            tabIndex={0}
          >
            <Logo size="sm" subtitle="Fast subtitle & transcript extraction" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 text-zinc-600">
            <a href="#how-it-works" onClick={(e) => handleNav('home', e)} className="hover:text-zinc-900 transition-colors">
              How It Works
            </a>
            <a href="#features" onClick={(e) => handleNav('home', e)} className="hover:text-zinc-900 transition-colors">
              Features
            </a>
            <a href="#faq" onClick={(e) => handleNav('home', e)} className="hover:text-zinc-900 transition-colors">
              FAQ
            </a>
            <span className="text-zinc-200 hidden sm:inline">|</span>
            <button
              id="footer-privacy-btn"
              type="button"
              onClick={(e) => handleNav('privacy', e)}
              className="hover:text-zinc-900 transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5 text-zinc-400" />
              Privacy Policy
            </button>
            <button
              id="footer-terms-btn"
              type="button"
              onClick={(e) => handleNav('terms', e)}
              className="hover:text-zinc-900 transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              Terms &amp; Conditions
            </button>
            <button
              id="footer-contact-btn"
              type="button"
              onClick={(e) => handleNav('contact', e)}
              className="hover:text-zinc-900 transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <Mail className="w-3.5 h-3.5 text-zinc-400" />
              Contact Us
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>&copy; {new Date().getFullYear()} YouTube Transcript Extractor. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-zinc-400">Not affiliated with YouTube or Google LLC</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
