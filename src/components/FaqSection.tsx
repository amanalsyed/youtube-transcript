import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'What is a YouTube transcript?',
      answer:
        'A YouTube transcript is the written version of the spoken content in a YouTube video. It can make video content easier to read, search, save, and review.',
    },
    {
      question: 'How do I get a transcript from a YouTube video?',
      answer:
        'Copy the YouTube video URL, paste it into the transcript generator, and click the generate button. If the video is supported, the transcript will be prepared for you.',
    },
    {
      question: 'How do I convert a YouTube video to text?',
      answer:
        'Paste the YouTube video link into the tool. The tool processes the supported video and produces a text transcript.',
    },
    {
      question: 'Is this a free YouTube transcript generator?',
      answer:
        'Yes, this YouTube transcript generator is completely free to use with no hidden fees, subscriptions, or credit card required.',
    },
    {
      question: 'Do I need to create an account?',
      answer:
        'No account is required. You can use the generator directly in your web browser without signing up or logging in.',
    },
    {
      question: 'Can I download a YouTube transcript?',
      answer:
        'If downloading is supported, you can save the generated transcript for later use in multiple formats including Plain Text (.txt), PDF (.pdf), SubRip subtitles (.srt), WebVTT (.vtt), and Markdown (.md).',
    },
    {
      question: 'Does the transcript include timestamps?',
      answer:
        'Timestamps can be included when they are available and supported by the transcription process. You can also toggle timestamps on or off at any time.',
    },
    {
      question: 'Can I translate a YouTube transcript?',
      answer:
        'If translation is supported, you can use the available language options to work with the transcript in another language, including side-by-side bilingual comparison.',
    },
    {
      question: 'How accurate are the transcripts?',
      answer:
        'Accuracy depends on factors such as audio quality, speech clarity, background noise, accents, multiple speakers, and technical terms. A transcript should always be reviewed before using it as a primary source for important work.',
    },
    {
      question: 'Can I transcribe long YouTube videos?',
      answer:
        'Yes, you can generate transcripts for long YouTube videos, full-length podcasts, university lectures, webinars, and documentaries.',
    },
    {
      question: "Why can't I generate a transcript for some YouTube videos?",
      answer:
        'Some videos may not have the captions or data needed by the tool. Restrictions, private video settings, and other video-specific limits can also prevent transcription.',
    },
    {
      question: 'Can I edit the transcript?',
      answer:
        'You can copy the transcript or download it into your favorite text editor, Notion, Microsoft Word, or Google Docs to format, annotate, and edit as you wish.',
    },
    {
      question: 'Can I use the tool on mobile?',
      answer:
        'Yes, if your web interface is mobile responsive, the tool can be used from any mobile browser on iOS (iPhone/iPad) and Android devices.',
    },
    {
      question: 'Which languages are supported?',
      answer:
        'The tool supports native YouTube captions in all creator-provided languages, as well as instant translation into 80+ global languages.',
    },
    {
      question: 'Can I use YouTube transcripts with AI?',
      answer:
        'Yes. Once you have the transcript, you can use the text with AI tools to summarize the video, extract key points, create notes, ask questions, or analyze the content.',
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <section id="faq" className="py-16 sm:py-20 bg-white border-t border-zinc-200/60 font-['Poppins',sans-serif]">
      {/* Schema.org JSON-LD FAQ structured data for rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-100/80 border border-zinc-200/70 text-xs font-semibold text-zinc-700 shadow-2xs mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
            Frequently Asked Questions
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
            Everything you need to know about generating, reading, and using YouTube video transcripts.
          </p>
        </div>

        <div className="divide-y divide-zinc-100 rounded-2xl bg-zinc-50/40 border border-zinc-200/70 shadow-xs overflow-hidden">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="transition-colors">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full py-4 sm:py-5 px-5 sm:px-6 flex items-center justify-between text-left gap-4 font-semibold text-sm sm:text-base text-zinc-900 hover:text-zinc-700 cursor-pointer"
                >
                  <span className="leading-snug">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-zinc-900' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
