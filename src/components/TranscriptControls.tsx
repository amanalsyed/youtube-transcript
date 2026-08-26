import React, { useState, useRef, useEffect } from 'react';
import {
  Copy,
  Search,
  Globe,
  ChevronUp,
  ChevronDown,
  X,
  Check,
  AlignLeft,
  FileText,
  Clock,
  Download,
  FileCode,
  FileCheck2,
  Subtitles,
  Sparkles,
  Share2,
} from 'lucide-react';
import { CaptionLanguage, CopyFormat, ExportFormat, VideoMetadata, TranscriptViewMode, TargetTranslationLanguage } from '../types';
import { ExportModal } from './ExportModal';

interface TranscriptControlsProps {
  video?: VideoMetadata;
  viewMode?: TranscriptViewMode;
  translatedTargetLanguage?: TargetTranslationLanguage | null;
  onCopy: (format: CopyFormat) => void;
  onDownload: (format: ExportFormat) => void;
  onOpenShare?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  matchCount: number;
  currentMatchIndex: number;
  onNextMatch: () => void;
  onPrevMatch: () => void;
  availableLanguages: CaptionLanguage[];
  selectedLanguage: CaptionLanguage;
  onLanguageSelect: (lang: CaptionLanguage) => void;
  isLanguageLoading: boolean;
  totalWords: number;
  totalSegments: number;
  showTimestamps: boolean;
  onToggleTimestamps: () => void;
  autoScroll?: boolean;
  onToggleAutoScroll?: () => void;
}

export const TranscriptControls: React.FC<TranscriptControlsProps> = ({
  video,
  viewMode = 'original',
  translatedTargetLanguage,
  onCopy,
  onDownload,
  onOpenShare,
  searchQuery,
  onSearchChange,
  matchCount,
  currentMatchIndex,
  onNextMatch,
  onPrevMatch,
  availableLanguages,
  selectedLanguage,
  onLanguageSelect,
  isLanguageLoading,
  totalWords,
  totalSegments,
  showTimestamps,
  onToggleTimestamps,
  autoScroll,
  onToggleAutoScroll,
}) => {
  const [copyDropdownOpen, setCopyDropdownOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<CopyFormat | null>(null);

  const copyDropdownRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        copyDropdownRef.current &&
        !copyDropdownRef.current.contains(event.target as Node)
      ) {
        setCopyDropdownOpen(false);
      }
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(event.target as Node)
      ) {
        setExportDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCopyClick = (format: CopyFormat) => {
    onCopy(format);
    setCopiedFormat(format);
    setCopyDropdownOpen(false);
    setTimeout(() => {
      setCopiedFormat(null);
    }, 2500);
  };

  const handleExportSelect = (format: ExportFormat) => {
    onDownload(format);
    setExportDropdownOpen(false);
  };

  return (
    <>
      <div className="bg-white border-b border-zinc-100 p-3 sm:p-4 flex flex-col gap-3 font-['Poppins',sans-serif]">
        {/* Top row: Language selection + Timestamps toggle + Copy dropdown + Export dropdown + Stats */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Language selector */}
            {availableLanguages.length > 0 && (
              <div className="relative inline-flex items-center">
                <Globe className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 pointer-events-none" />
                <select
                  id="language-select"
                  value={selectedLanguage.code}
                  disabled={isLanguageLoading || availableLanguages.length <= 1}
                  onChange={(e) => {
                    const found = availableLanguages.find((l) => l.code === e.target.value);
                    if (found) onLanguageSelect(found);
                  }}
                  className="pl-8 pr-7 py-1.5 bg-zinc-50/80 hover:bg-zinc-100/80 border border-zinc-200/70 text-zinc-800 text-xs sm:text-sm font-medium rounded-xl appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-zinc-900/10 transition-colors disabled:opacity-60"
                  aria-label="Select transcript language"
                >
                  {availableLanguages.map((lang) => (
                    <option key={`${lang.code}-${lang.vssId || ''}`} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2 pointer-events-none" />
              </div>
            )}

            {/* Timestamps ON / OFF Toggle Button */}
            <button
              id="toggle-timestamps-btn"
              type="button"
              onClick={onToggleTimestamps}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl border transition-all cursor-pointer select-none ${
                showTimestamps
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                  : 'bg-zinc-100/80 text-zinc-600 border-zinc-200/60 hover:bg-zinc-200/80 hover:text-zinc-900'
              }`}
              title={showTimestamps ? 'Hide timestamps (Turn OFF)' : 'Show timestamps (Turn ON)'}
              aria-pressed={showTimestamps}
            >
              <Clock className={`w-3.5 h-3.5 ${showTimestamps ? 'text-zinc-300' : 'text-zinc-500'}`} />
              <span>Timestamps</span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md transition-colors ${
                  showTimestamps
                    ? 'bg-zinc-800 text-emerald-300'
                    : 'bg-zinc-200 text-zinc-600'
                }`}
              >
                {showTimestamps ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Auto-Scroll Toggle (if provided) */}
            {onToggleAutoScroll && (
              <button
                id="toggle-autoscroll-btn"
                type="button"
                onClick={onToggleAutoScroll}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all cursor-pointer select-none ${
                  autoScroll
                    ? 'bg-zinc-50 text-zinc-900 border-zinc-200/80 hover:bg-zinc-100'
                    : 'bg-zinc-50 text-zinc-400 border-zinc-200/50 hover:text-zinc-600'
                }`}
                title={autoScroll ? 'Auto-scroll is tracking video playback' : 'Auto-scroll is paused'}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    autoScroll ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
                  }`}
                />
                <span>Auto-scroll</span>
              </button>
            )}

            {/* Quick stats pill */}
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 text-xs text-zinc-500 bg-zinc-50/80 border border-zinc-200/60 rounded-xl font-medium">
              <FileText className="w-3 h-3 text-zinc-400" />
              {totalWords.toLocaleString()} words &middot; {totalSegments} segments
            </span>
          </div>

          {/* Right side Action Buttons: Share, Copy Dropdown & Export Dropdown */}
          <div className="flex items-center gap-2">
            {/* Share Deep Link Button */}
            {onOpenShare && (
              <button
                id="share-transcript-btn"
                type="button"
                onClick={onOpenShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 bg-zinc-100/90 hover:bg-zinc-200/80 active:bg-zinc-300/80 rounded-xl transition-colors cursor-pointer border border-transparent shadow-2xs"
                title="Share deep link to current timestamp"
              >
                <Share2 className="w-3.5 h-3.5 text-zinc-600" />
                <span>Share</span>
              </button>
            )}

            {/* Copy Dropdown Menu */}
            <div className="relative" ref={copyDropdownRef}>
              <button
                id="copy-dropdown-trigger"
                type="button"
                onClick={() => setCopyDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 bg-zinc-100/90 hover:bg-zinc-200/80 active:bg-zinc-300/80 rounded-xl transition-colors cursor-pointer border border-transparent shadow-2xs"
                title="Copy transcript to clipboard"
                aria-expanded={copyDropdownOpen}
                aria-haspopup="true"
              >
                {copiedFormat ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">
                      {copiedFormat === 'with-timestamps'
                        ? 'Copied with Timestamps!'
                        : copiedFormat === 'markdown'
                        ? 'Copied Markdown!'
                        : 'Copied Plain Text!'}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Copy</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-150 ${
                        copyDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </>
                )}
              </button>

              {/* Copy Dropdown Options */}
              {copyDropdownOpen && (
                <div
                  id="copy-dropdown-menu"
                  className="absolute left-0 sm:left-auto sm:right-0 mt-1.5 w-64 max-w-[calc(100vw-32px)] bg-white border border-zinc-200/80 rounded-2xl shadow-2xl shadow-zinc-900/15 z-50 py-1.5 animate-fadeIn text-xs sm:text-sm overflow-hidden"
                >
                  <div className="px-3.5 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Copy to Clipboard
                  </div>

                  <button
                    id="copy-option-text"
                    type="button"
                    onClick={() => handleCopyClick('text-only')}
                    className="w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-zinc-50 transition-colors text-zinc-800 cursor-pointer"
                  >
                    <AlignLeft className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-zinc-900">Plain Text</div>
                      <div className="text-[11px] text-zinc-500 leading-tight">
                        Continuous text without timestamps
                      </div>
                    </div>
                  </button>

                  <button
                    id="copy-option-timestamps"
                    type="button"
                    onClick={() => handleCopyClick('with-timestamps')}
                    className="w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-zinc-50 transition-colors text-zinc-800 cursor-pointer border-t border-zinc-100"
                  >
                    <Clock className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-zinc-900">With Timestamps</div>
                      <div className="text-[11px] text-zinc-500 leading-tight">
                        Formatted with [MM:SS] timestamps per line
                      </div>
                    </div>
                  </button>

                  <button
                    id="copy-option-markdown"
                    type="button"
                    onClick={() => handleCopyClick('markdown')}
                    className="w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-zinc-50 transition-colors text-zinc-800 cursor-pointer border-t border-zinc-100"
                  >
                    <FileText className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-zinc-900">Markdown Format</div>
                      <div className="text-[11px] text-zinc-500 leading-tight">
                        Title header &amp; bulleted timestamps for Notion
                      </div>
                    </div>
                  </button>

                  {viewMode === 'side-by-side' && (
                    <button
                      id="copy-option-bilingual"
                      type="button"
                      onClick={() => handleCopyClick('bilingual')}
                      className="w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-zinc-50 transition-colors text-zinc-800 cursor-pointer border-t border-zinc-100 bg-indigo-50/50"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-indigo-950">Bilingual (Side-by-Side)</div>
                        <div className="text-[11px] text-indigo-600 leading-tight">
                          Both original &amp; {translatedTargetLanguage?.name || 'translated'} text with timing
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Export / Download Dropdown & Modal trigger */}
            <div className="relative" ref={exportDropdownRef}>
              <div className="inline-flex rounded-xl shadow-2xs">
                <button
                  id="export-dropdown-trigger"
                  type="button"
                  onClick={() => setExportDropdownOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 rounded-xl transition-colors cursor-pointer"
                  title="Export or download transcript"
                  aria-expanded={exportDropdownOpen}
                  aria-haspopup="true"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-200" />
                  <span>Export</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-zinc-300 transition-transform duration-150 ${
                      exportDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Export Dropdown Options */}
              {exportDropdownOpen && (
                <div
                  id="export-dropdown-menu"
                  className="absolute right-0 mt-1.5 w-72 max-w-[calc(100vw-32px)] bg-white border border-zinc-200/80 rounded-2xl shadow-2xl shadow-zinc-900/15 z-50 py-1.5 animate-fadeIn text-xs sm:text-sm overflow-hidden"
                >
                  <div className="px-3.5 py-1.5 flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    <span>Export Formats</span>
                    <button
                      type="button"
                      onClick={() => {
                        setExportDropdownOpen(false);
                        setIsExportModalOpen(true);
                      }}
                      className="text-zinc-900 hover:underline cursor-pointer lowercase font-medium"
                    >
                      view all
                    </button>
                  </div>

                  {/* PDF Document */}
                  <button
                    id="export-option-pdf"
                    type="button"
                    onClick={() => handleExportSelect('pdf')}
                    className="w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-zinc-50 transition-colors text-zinc-800 cursor-pointer"
                  >
                    <FileCheck2 className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900">PDF Document</span>
                        <span className="text-[10px] font-mono bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-200/60 font-semibold">
                          .pdf
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 leading-tight">
                        Print-ready document with metadata &amp; layout
                      </div>
                    </div>
                  </button>

                  {/* SRT Subtitle */}
                  <button
                    id="export-option-srt"
                    type="button"
                    onClick={() => handleExportSelect('srt')}
                    className="w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-zinc-50 transition-colors text-zinc-800 cursor-pointer border-t border-zinc-100"
                  >
                    <Subtitles className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900">SubRip Subtitles</span>
                        <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200/60 font-semibold">
                          .srt
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 leading-tight">
                        Standard captions for video editors (Premiere, Resolve)
                      </div>
                    </div>
                  </button>

                  {/* WebVTT */}
                  <button
                    id="export-option-vtt"
                    type="button"
                    onClick={() => handleExportSelect('vtt')}
                    className="w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-zinc-50 transition-colors text-zinc-800 cursor-pointer border-t border-zinc-100"
                  >
                    <FileCode className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900">WebVTT Captions</span>
                        <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200/60 font-semibold">
                          .vtt
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 leading-tight">
                        Web caption standard for HTML5 players
                      </div>
                    </div>
                  </button>

                  {/* Markdown Notes */}
                  <button
                    id="export-option-markdown"
                    type="button"
                    onClick={() => handleExportSelect('markdown')}
                    className="w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-zinc-50 transition-colors text-zinc-800 cursor-pointer border-t border-zinc-100"
                  >
                    <FileText className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900">Markdown Notes</span>
                        <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200/60 font-semibold">
                          .md
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 leading-tight">
                        Formatted notes for Notion, Obsidian &amp; docs
                      </div>
                    </div>
                  </button>

                  {/* Timestamped Text */}
                  <button
                    id="export-option-txt-time"
                    type="button"
                    onClick={() => handleExportSelect('txt-timestamps')}
                    className="w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-zinc-50 transition-colors text-zinc-800 cursor-pointer border-t border-zinc-100"
                  >
                    <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900">With Timestamps</span>
                        <span className="text-[10px] font-mono bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded border border-zinc-200 font-semibold">
                          .txt
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 leading-tight">
                        Plain text with [00:00] timing per line
                      </div>
                    </div>
                  </button>

                  {/* Plain Text */}
                  <button
                    id="export-option-txt-plain"
                    type="button"
                    onClick={() => handleExportSelect('txt-plain')}
                    className="w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-zinc-50 transition-colors text-zinc-800 cursor-pointer border-t border-zinc-100"
                  >
                    <AlignLeft className="w-4 h-4 text-zinc-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900">Plain Text</span>
                        <span className="text-[10px] font-mono bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded border border-zinc-200 font-semibold">
                          .txt
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 leading-tight">
                        Clean paragraph text without timecodes
                      </div>
                    </div>
                  </button>

                  {/* Open Modal view all button */}
                  <div className="p-2 border-t border-zinc-100 bg-zinc-50/50">
                    <button
                      id="open-export-modal-btn"
                      type="button"
                      onClick={() => {
                        setExportDropdownOpen(false);
                        setIsExportModalOpen(true);
                      }}
                      className="w-full py-2 px-3 bg-zinc-200/70 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs rounded-xl transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
                      <span>Compare All Formats</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom row: Search within transcript */}
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="transcript-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search within transcript (e.g. key terms, topics)..."
            className="w-full pl-9 pr-28 py-2 bg-zinc-50/80 focus:bg-white border border-zinc-200/70 focus:border-zinc-300 rounded-xl text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all font-normal"
          />

          {searchQuery && (
            <div className="absolute right-2 flex items-center gap-1 bg-white pl-2 py-0.5 rounded-lg border border-zinc-200/70 text-xs text-zinc-600 shadow-2xs">
              <span className="px-1 font-medium tabular-nums">
                {matchCount > 0 ? `${currentMatchIndex + 1} of ${matchCount}` : '0 matches'}
              </span>

              {matchCount > 0 && (
                <div className="flex items-center border-l border-zinc-200/80 ml-1 pl-1">
                  <button
                    type="button"
                    onClick={onPrevMatch}
                    className="p-1 hover:bg-zinc-100 rounded text-zinc-600 hover:text-zinc-900"
                    aria-label="Previous match"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={onNextMatch}
                    className="p-1 hover:bg-zinc-100 rounded text-zinc-600 hover:text-zinc-900"
                    aria-label="Next match"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-700 ml-0.5"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Full Feature Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onSelectFormat={handleExportSelect}
        video={video}
        totalWords={totalWords}
        totalSegments={totalSegments}
      />
    </>
  );
};
