import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, ArrowLeft, Clock, Sparkles, Copy, Check, HelpCircle, AlertCircle } from 'lucide-react';

interface ContactUsProps {
  onBack: () => void;
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ContactUs: React.FC<ContactUsProps> = ({ onBack, onToast }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('support');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) {
      if (onToast) onToast('Please provide your email and a message.', 'error');
      return;
    }

    setIsSubmitting(true);
    // Simulate sending message with realistic delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      if (onToast) {
        onToast('Thank you! Your message has been sent successfully.', 'success');
      }
    }, 1000);
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('support@youtubetranscript.app');
      setCopiedEmail(true);
      if (onToast) onToast('Email address copied to clipboard!', 'success');
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-['Poppins',sans-serif]">
      {/* Back Button */}
      <button
        id="contact-back-btn"
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-red-400 text-xs font-semibold backdrop-blur-xs mb-4 border border-white/10">
            <Mail className="w-3.5 h-3.5" />
            Get in Touch
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-3">
            Contact Us
          </h1>
          <p className="text-zinc-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Have questions, feature suggestions, or feedback about the transcript generator? We’d love to hear from you.
          </p>
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              Typical response time: under 24 hours
            </span>
            <span>&bull;</span>
            <span>Worldwide support</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200/70 shadow-2xs">
            {isSubmitted ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900 mb-2">
                  Message Sent!
                </h2>
                <p className="text-sm text-zinc-600 max-w-sm mx-auto mb-6">
                  Thank you for reaching out. We have received your note and our team will get back to you at <strong>{email}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setName('');
                    setEmail('');
                    setSubject('');
                    setMessage('');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-bold text-zinc-900">
                    Send a Message
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Smith"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-topic" className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      Topic / Category
                    </label>
                    <select
                      id="contact-topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all cursor-pointer"
                    >
                      <option value="support">Technical Support</option>
                      <option value="feature">Feature Request</option>
                      <option value="bug">Report an Issue / Bug</option>
                      <option value="general">General Inquiry</option>
                      <option value="partnership">Partnership &amp; API</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief summary..."
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what's on your mind, include any video URLs or error messages if reporting a bug..."
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all resize-y"
                  />
                </div>

                <button
                  id="contact-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 active:bg-black rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Direct Info & Quick Help */}
        <div className="lg:col-span-5 space-y-6">
          {/* Email Direct Box */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200/70 shadow-2xs">
            <h3 className="text-sm font-bold text-zinc-900 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-red-500" />
              Direct Email
            </h3>
            <p className="text-xs text-zinc-500 mb-3">
              Prefer writing directly from your email client? Copy our support address:
            </p>
            <div className="flex items-center justify-between gap-2 p-2.5 bg-zinc-50 rounded-xl border border-zinc-200">
              <span className="text-xs font-mono text-zinc-800 truncate">
                support@youtubetranscript.app
              </span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Copy email to clipboard"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Quick FAQ Highlights */}
          <div className="bg-white rounded-2xl p-6 border border-zinc-200/70 shadow-2xs">
            <h3 className="text-sm font-bold text-zinc-900 mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-500" />
              Common Questions
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-semibold text-zinc-800 mb-1">
                  Why can't I get transcripts for a specific video?
                </p>
                <p className="text-zinc-500 leading-relaxed">
                  The video must be public or unlisted with closed captions or auto-generated subtitles enabled by YouTube.
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-100">
                <p className="font-semibold text-zinc-800 mb-1">
                  Is there an export limit?
                </p>
                <p className="text-zinc-500 leading-relaxed">
                  No, you can freely download transcripts in TXT, SRT, VTT, JSON, and CSV formats.
                </p>
              </div>
            </div>
          </div>
        </div>
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
