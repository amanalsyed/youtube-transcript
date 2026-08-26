import React, { useEffect } from 'react';
import { ShieldCheck, Lock, Eye, Database, Globe, ArrowLeft, CheckCircle2, FileText, Bell } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-['Poppins',sans-serif]">
      {/* Back Button */}
      <button
        id="privacy-back-btn"
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-semibold backdrop-blur-xs mb-4 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5" />
            Your Privacy Matters
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-zinc-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            We are committed to transparency. Learn how YouTube Transcript Extractor handles your data, respects your privacy, and adheres to strict security standards.
          </p>
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <span>Last updated: August 2026</span>
            <span>&bull;</span>
            <span>Version: 2.4.0</span>
            <span>&bull;</span>
            <span>Effective: Immediately</span>
          </div>
        </div>
      </div>

      {/* Policy Content Sections */}
      <div className="space-y-8 text-zinc-700 text-sm sm:text-base leading-relaxed">
        {/* Section 1 */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200/70 shadow-2xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
              1. Information We Collect
            </h2>
          </div>
          <p className="mb-4 text-zinc-600">
            YouTube Transcript Extractor is designed with privacy-by-default architecture. We do not require account registration or login to extract transcripts:
          </p>
          <ul className="space-y-2.5 text-zinc-600">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
              <span><strong>Provided YouTube URLs:</strong> We process public video URLs submitted by you strictly to retrieve the public caption and transcript data associated with the video.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
              <span><strong>Local Browser Storage:</strong> Your recent transcript history and formatting preferences (e.g. timestamps toggle, auto-scroll) are stored locally in your browser’s <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs">localStorage</code> and never sent to our servers.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
              <span><strong>Technical Telemetry:</strong> Standard non-identifying server logs (IP address, browser user-agent, response codes) for rate-limiting, uptime diagnostics, and DDoS protection.</span>
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200/70 shadow-2xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
              2. How We Use the Information
            </h2>
          </div>
          <p className="mb-4 text-zinc-600">
            The data collected is utilized solely to provide, operate, and maintain the transcription utility:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
              <h3 className="font-semibold text-zinc-900 text-sm mb-1">Transcript Extraction</h3>
              <p className="text-xs text-zinc-500">Retrieving and parsing public timed-text subtitle tracks for your chosen language.</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
              <h3 className="font-semibold text-zinc-900 text-sm mb-1">Format Transformations</h3>
              <p className="text-xs text-zinc-500">Formatting text into TXT, SRT, VTT, JSON, CSV, and Markdown on-demand.</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
              <h3 className="font-semibold text-zinc-900 text-sm mb-1">Abuse & Rate Limiting</h3>
              <p className="text-xs text-zinc-500">Preventing automated scrapers and denial-of-service abuse to ensure fair service for all users.</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
              <h3 className="font-semibold text-zinc-900 text-sm mb-1">Zero Third-Party Ad Tracking</h3>
              <p className="text-xs text-zinc-500">We do not sell, monetize, or broker your personal information or search history to data aggregators.</p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200/70 shadow-2xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
              3. YouTube API & Third-Party Services
            </h2>
          </div>
          <p className="mb-3 text-zinc-600">
            This tool processes publicly accessible video content. When you interact with YouTube videos or embeds, you are also subject to YouTube’s and Google’s respective policies:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-600 ml-1">
            <li><a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-red-600 underline font-medium hover:text-red-700">YouTube Terms of Service</a></li>
            <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-red-600 underline font-medium hover:text-red-700">Google Privacy Policy</a></li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200/70 shadow-2xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
              4. Cookies and Client-Side Storage
            </h2>
          </div>
          <p className="text-zinc-600 mb-3">
            We do not use intrusive tracking cookies. We utilize standard Web Storage (such as <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs">localStorage</code>) purely to remember:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-zinc-600 ml-1 mb-4">
            <li>Your recent transcript history list (cleared anytime using the "Clear History" button)</li>
            <li>Active view preferences (e.g. show timestamps, auto-scroll state)</li>
          </ul>
          <p className="text-xs text-zinc-500">
            You may clear your browser cache and cookies at any time from your browser settings without affecting the core functionality of the tool.
          </p>
        </section>

        {/* Section 5 */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200/70 shadow-2xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
              5. Contact & Inquiries
            </h2>
          </div>
          <p className="text-zinc-600 mb-4">
            If you have questions, feedback, or privacy concerns regarding this Privacy Policy, please reach out to our team via our Contact page or via email at:
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-200 font-mono text-xs sm:text-sm text-zinc-800">
            privacy@youtubetranscript.app
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
