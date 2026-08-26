import React, { useEffect } from 'react';
import { Scale, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, FileText, Ban, HelpCircle } from 'lucide-react';

interface TermsConditionsProps {
  onBack: () => void;
}

export const TermsConditions: React.FC<TermsConditionsProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-['Poppins',sans-serif]">
      {/* Back Button */}
      <button
        id="terms-back-btn"
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 px-3.5 py-2 mb-6 text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200/80 rounded-xl shadow-2xs transition-all hover:-translate-x-0.5 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-zinc-500" />
        Back to Generator
      </button>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white rounded-3xl p-6 sm:p-10 mb-10 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-400 text-xs font-semibold backdrop-blur-xs mb-4 border border-white/10">
            <Scale className="w-3.5 h-3.5" />
            Terms of Service
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-3">
            Terms &amp; Conditions
          </h1>
          <p className="text-zinc-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Please read these terms and conditions carefully before using the YouTube Transcript Extractor application.
          </p>
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <span>Last updated: August 2026</span>
            <span>&bull;</span>
            <span>Applicable worldwide</span>
            <span>&bull;</span>
            <span>Free service</span>
          </div>
        </div>
      </div>

      {/* Terms Content */}
      <div className="space-y-8 text-zinc-700 text-sm sm:text-base leading-relaxed">
        {/* Section 1 */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200/70 shadow-2xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
              1. Acceptance of Terms
            </h2>
          </div>
          <p className="text-zinc-600 mb-3">
            By accessing or using the YouTube Transcript Extractor service, you confirm that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use the application.
          </p>
          <p className="text-zinc-600">
            We reserve the right to modify or replace these terms at our sole discretion. Continued use of the platform following the posting of any revisions constitutes your acceptance of the updated terms.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200/70 shadow-2xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
              2. Permitted Use &amp; Intellectual Property
            </h2>
          </div>
          <p className="text-zinc-600 mb-4">
            YouTube Transcript Extractor provides a tool for personal, educational, research, and non-commercial utility to transcribe publicly accessible YouTube videos:
          </p>
          <ul className="space-y-2.5 text-zinc-600">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
              <span><strong>Copyright Ownership:</strong> Video content, captions, titles, thumbnails, and audio belong to their respective copyright owners and video creators. This tool does not claim ownership over any extracted video text or media.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
              <span><strong>Fair Use:</strong> You are responsible for ensuring that your usage, citation, and reproduction of any transcript aligns with fair use laws, educational exemptions, and copyright regulations applicable in your jurisdiction.</span>
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200/70 shadow-2xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Ban className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
              3. Prohibited Activities
            </h2>
          </div>
          <p className="text-zinc-600 mb-3">When using this service, you agree NOT to:</p>
          <ul className="list-disc list-inside space-y-2 text-zinc-600 ml-1">
            <li>Engage in automated bulk harvesting, crawling, or denial-of-service attempts that degrade server capacity for other users.</li>
            <li>Attempt to bypass rate limits, server security controls, or video access restrictions.</li>
            <li>Use the service to process or distribute defamatory, infringing, or illegal material.</li>
            <li>Reverse engineer or misuse backend APIs for unauthorized secondary redistribution.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200/70 shadow-2xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
              4. Disclaimer of Warranties &amp; Limitation of Liability
            </h2>
          </div>
          <p className="text-zinc-600 mb-3">
            The service is provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis without warranties of any kind, either express or implied.
          </p>
          <p className="text-zinc-600 mb-3">
            We do not guarantee that transcripts will always be error-free, uninterrupted, or 100% accurate, as captions are generated by YouTube's automated speech recognition or user-uploaded subtitle tracks.
          </p>
          <p className="text-xs text-zinc-500">
            In no event shall YouTube Transcript Extractor or its creators be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use this service.
          </p>
        </section>

        {/* Section 5 */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200/70 shadow-2xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
              5. Governing Law &amp; Contact
            </h2>
          </div>
          <p className="text-zinc-600 mb-4">
            These terms shall be governed in accordance with standard international fair use and digital service guidelines. If you have questions regarding these terms, please contact us at:
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-200 font-mono text-xs sm:text-sm text-zinc-800">
            legal@youtubetranscript.app
          </div>
        </section>
      </div>

      {/* Footer Back */}
      <div className="mt-12 text-center">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Transcript Generator
        </button>
      </div>
    </div>
  );
};
