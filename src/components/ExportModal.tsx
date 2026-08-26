import React from 'react';
import {
  X,
  Download,
  FileText,
  FileCode,
  Clock,
  AlignLeft,
  FileCheck2,
  Subtitles,
  Share2,
} from 'lucide-react';
import { ExportFormat, VideoMetadata } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFormat: (format: ExportFormat) => void;
  video?: VideoMetadata;
  totalWords: number;
  totalSegments: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onSelectFormat,
  video,
  totalWords,
  totalSegments,
}) => {
  if (!isOpen) return null;

  const exportOptions: {
    format: ExportFormat;
    title: string;
    extension: string;
    badge: string;
    icon: React.ReactNode;
    description: string;
    popular?: boolean;
    useCase: string;
  }[] = [
    {
      format: 'pdf',
      title: 'PDF Document',
      extension: '.pdf',
      badge: 'Print / Save',
      icon: <FileCheck2 className="w-5 h-5 text-red-600" />,
      description: 'Cleanly styled 2-column printable document with video metadata, timestamps, and page numbers.',
      popular: true,
      useCase: 'Best for offline reading, studying & printing',
    },
    {
      format: 'srt',
      title: 'SubRip Subtitle',
      extension: '.srt',
      badge: 'Subtitles',
      icon: <Subtitles className="w-5 h-5 text-indigo-600" />,
      description: 'Standard video caption format with sequential indices, millisecond timecodes (00:00:00,000), and subtitles.',
      popular: true,
      useCase: 'For Premiere Pro, DaVinci Resolve, Final Cut & VLC',
    },
    {
      format: 'vtt',
      title: 'WebVTT Captions',
      extension: '.vtt',
      badge: 'Web Captions',
      icon: <FileCode className="w-5 h-5 text-blue-600" />,
      description: 'W3C HTML5 video subtitle format with millisecond timestamps (00:00:00.000) and metadata header.',
      useCase: 'For HTML5 players, online video hosting & web apps',
    },
    {
      format: 'markdown',
      title: 'Markdown Notes',
      extension: '.md',
      badge: 'Notes / Docs',
      icon: <FileText className="w-5 h-5 text-emerald-600" />,
      description: 'Structured Markdown file with video title, metadata block, and timestamped bullet list.',
      popular: true,
      useCase: 'For Notion, Obsidian, GitHub & Apple Notes',
    },
    {
      format: 'txt-timestamps',
      title: 'Timestamped Text',
      extension: '.txt',
      badge: 'Text + Time',
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      description: 'Plain text file containing each spoken sentence prefixed with [MM:SS] timestamps.',
      useCase: 'For quick quotes, transcripts & reference citations',
    },
    {
      format: 'txt-plain',
      title: 'Plain Text',
      extension: '.txt',
      badge: 'Text Only',
      icon: <AlignLeft className="w-5 h-5 text-zinc-600" />,
      description: 'Continuous dialogue paragraphs without any timestamp prefixes or numbers.',
      useCase: 'For articles, copy-pasting, proofreading & AI prompts',
    },
  ];

  return (
    <div
      id="export-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-fadeIn font-['Poppins',sans-serif]"
      onClick={onClose}
    >
      <div
        id="export-modal-container"
        className="relative w-full max-w-2xl bg-white rounded-3xl border border-zinc-200/80 shadow-2xl overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-2xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-lg">Export Transcript</h3>
              <p className="text-xs text-zinc-500">
                Choose from SRT, VTT, PDF, Markdown, or Plain Text formats
              </p>
            </div>
          </div>

          <button
            id="close-export-modal-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            aria-label="Close export modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video metadata strip */}
        {video && (
          <div className="px-6 py-3 bg-zinc-50/80 border-b border-zinc-100 flex flex-wrap items-center justify-between text-xs text-zinc-600 gap-2">
            <span className="font-medium text-zinc-800 truncate max-w-md">
              {video.title}
            </span>
            <span className="font-mono text-zinc-500">
              {totalWords.toLocaleString()} words &middot; {totalSegments} segments
            </span>
          </div>
        )}

        {/* Formats Grid */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {exportOptions.map((opt) => (
              <button
                key={opt.format}
                id={`export-format-${opt.format}`}
                type="button"
                onClick={() => {
                  onSelectFormat(opt.format);
                  onClose();
                }}
                className="relative p-4 rounded-2xl border border-zinc-200/80 hover:border-zinc-900 bg-white hover:bg-zinc-50/60 transition-all text-left group cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-zinc-100/90 group-hover:bg-white flex items-center justify-center transition-colors">
                        {opt.icon}
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900 text-sm group-hover:text-zinc-950 flex items-center gap-1.5">
                          {opt.title}
                          <span className="font-mono text-[10px] text-zinc-400 font-normal">
                            {opt.extension}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                          {opt.badge}
                        </span>
                      </div>
                    </div>

                    {opt.popular && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full shrink-0">
                        Popular
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-600 leading-relaxed font-normal mb-3">
                    {opt.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-100/80 text-[11px] text-zinc-500 font-medium flex items-center justify-between">
                  <span className="truncate">{opt.useCase}</span>
                  <Download className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900 transition-colors shrink-0 ml-1" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50/60 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          <span>All exports include precise millisecond timecodes where supported.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
