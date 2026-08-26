import React from 'react';
import { ArrowUp, Sparkles, Mail, Info } from 'lucide-react';

interface AboutCtaSectionProps {
  onNavigateContact?: () => void;
  onScrollToTop?: () => void;
}

export const AboutCtaSection: React.FC<AboutCtaSectionProps> = ({
  onNavigateContact,
  onScrollToTop,
}) => {
  const handleScrollToInput = () => {
    if (onScrollToTop) {
      onScrollToTop();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const inputEl = document.getElementById('youtube-url-input');
      if (inputEl) {
        setTimeout(() => inputEl.focus(), 300);
      }
    }
  };

  return (
    <section id="about-cta" className="py-16 sm:py-20 bg-zinc-50/40 border-t border-zinc-200/60 font-['Poppins',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">

        {/* About Our YouTube Transcript Tool */}
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-zinc-200/70 text-xs font-semibold text-zinc-700 shadow-2xs mb-4">
            <Info className="w-3.5 h-3.5 text-zinc-500" />
            About Our YouTube Transcript Tool
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight mb-4">
            About Our YouTube Transcript Tool
          </h2>
          <div className="space-y-3 text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
            <p>
              We built this tool to make it easier to get useful text from YouTube videos.
            </p>
            <p>
              Instead of watching a long video again just to find one section, you can work with the written transcript.
            </p>
            <p className="font-semibold text-zinc-800">
              Our goal is simple: give you a quick way to get, read, copy, and use YouTube transcripts.
            </p>
            {onNavigateContact && (
              <p className="pt-2 text-xs sm:text-sm text-zinc-500">
                Contact us if you have a question about the tool:{' '}
                <button
                  type="button"
                  onClick={onNavigateContact}
                  className="font-medium text-zinc-900 underline hover:text-zinc-700 cursor-pointer"
                >
                  Contact Us
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Start Generating Your YouTube Transcript (Bottom CTA Box) */}
        <div className="p-8 sm:p-12 rounded-3xl bg-zinc-900 text-white shadow-xl max-w-4xl mx-auto text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Start Generating Your YouTube Transcript
            </h2>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-normal">
              Have a YouTube video you want to turn into text?
            </p>
            <p className="text-zinc-400 text-xs sm:text-sm font-normal">
              Paste the URL and generate your transcript.
            </p>
            <div className="pt-4">
              <button
                id="cta-generate-transcript-btn"
                type="button"
                onClick={handleScrollToInput}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-sm sm:text-base rounded-2xl transition-all shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Generate YouTube Transcript</span>
                <ArrowUp className="w-4 h-4 text-zinc-700 ml-1" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
