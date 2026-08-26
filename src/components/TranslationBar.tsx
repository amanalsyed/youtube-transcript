import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Languages,
  Sparkles,
  Columns2,
  FileText,
  Check,
  ChevronDown,
  Loader2,
  X,
  Search,
} from 'lucide-react';
import { TargetTranslationLanguage, TranslatedTranscriptData, TranscriptViewMode } from '../types';
import { ALL_TRANSLATION_LANGUAGES } from '../data/translationLanguages';

export { ALL_TRANSLATION_LANGUAGES as POPULAR_TARGET_LANGUAGES };

interface TranslationBarProps {
  originalLanguageName?: string;
  selectedTargetLang: TargetTranslationLanguage;
  onSelectTargetLang: (lang: TargetTranslationLanguage) => void;
  onTranslate: () => void;
  isTranslating: boolean;
  translatedData: TranslatedTranscriptData | null;
  viewMode: TranscriptViewMode;
  onChangeViewMode: (mode: TranscriptViewMode) => void;
  onClearTranslation: () => void;
}

export const TranslationBar: React.FC<TranslationBarProps> = ({
  originalLanguageName = 'English',
  selectedTargetLang,
  onSelectTargetLang,
  onTranslate,
  isTranslating,
  translatedData,
  viewMode,
  onChangeViewMode,
  onClearTranslation,
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus search input when dropdown opens
  useEffect(() => {
    if (langDropdownOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchFilter('');
    }
  }, [langDropdownOpen]);

  // Filtered languages
  const filteredLanguages = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return ALL_TRANSLATION_LANGUAGES;
    return ALL_TRANSLATION_LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [searchFilter]);

  const hasTranslation = Boolean(translatedData);

  return (
    <div
      id="transcript-translation-bar"
      className="bg-zinc-50/90 border-b border-zinc-200/70 px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 font-['Poppins',sans-serif] text-xs sm:text-sm"
    >
      {/* Left side: Language Selector & Action */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-semibold mr-1">
          <Languages className="w-3.5 h-3.5 text-zinc-700" />
          <span className="hidden sm:inline">Translate:</span>
        </div>

        {/* Target Language Dropdown Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="translation-language-picker"
            type="button"
            onClick={() => setLangDropdownOpen((prev) => !prev)}
            disabled={isTranslating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-100/90 border border-zinc-200 rounded-xl text-zinc-800 font-medium text-xs sm:text-sm shadow-2xs cursor-pointer transition-colors disabled:opacity-60"
            title="Choose translation language (80+ available)"
            aria-haspopup="true"
            aria-expanded={langDropdownOpen}
          >
            <span className="text-base leading-none">{selectedTargetLang.flag}</span>
            <span className="font-semibold text-zinc-900">{selectedTargetLang.name}</span>
            <span className="text-zinc-400 text-[11px] hidden md:inline">({selectedTargetLang.nativeName})</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-0.5" />
          </button>

          {langDropdownOpen && (
            <div
              id="translation-language-menu"
              className="absolute left-0 top-full mt-1.5 w-72 max-h-80 overflow-hidden flex flex-col bg-white border border-zinc-200 rounded-2xl shadow-xl shadow-zinc-900/10 z-50 py-2 animate-fadeIn"
            >
              {/* Header & Quick Search input */}
              <div className="px-3 pb-2 border-b border-zinc-100 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400">
                  <span className="uppercase tracking-wider">Select Language</span>
                  <span className="bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded-md font-mono text-[10px]">
                    {ALL_TRANSLATION_LANGUAGES.length} Languages
                  </span>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search language (e.g. Spanish, German, Thai)..."
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 placeholder:text-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all"
                  />
                  {searchFilter && (
                    <button
                      type="button"
                      onClick={() => setSearchFilter('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Language List */}
              <div className="overflow-y-auto flex-1 py-1 max-h-56">
                {filteredLanguages.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-zinc-400">
                    No language matching "{searchFilter}"
                  </div>
                ) : (
                  filteredLanguages.map((lang) => {
                    const isSelected = selectedTargetLang.code === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          onSelectTargetLang(lang);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer text-xs ${
                          isSelected ? 'bg-zinc-100 font-semibold text-zinc-900' : 'text-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base leading-none shrink-0">{lang.flag}</span>
                          <span className="font-medium text-zinc-900 truncate">{lang.name}</span>
                          <span className="text-zinc-400 text-[11px] truncate">({lang.nativeName})</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0 ml-1.5" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Translate Trigger Button */}
        {(!hasTranslation || translatedData?.targetLanguage.code !== selectedTargetLang.code) && (
          <button
            id="trigger-translate-btn"
            type="button"
            onClick={onTranslate}
            disabled={isTranslating}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white rounded-xl text-xs sm:text-sm font-medium shadow-2xs transition-all cursor-pointer disabled:opacity-60"
            title={`Translate transcript into ${selectedTargetLang.name}`}
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-300" />
                <span>Translating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Translate</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Right side: View Toggle Tabs (Original vs Translated vs Side-by-Side) */}
      {hasTranslation && (
        <div className="flex items-center gap-1.5 animate-fadeIn">
          <div className="inline-flex items-center p-0.5 bg-zinc-200/80 rounded-xl border border-zinc-300/60 shadow-inner">
            {/* View 1: Original */}
            <button
              id="view-mode-original-btn"
              type="button"
              onClick={() => onChangeViewMode('original')}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'original'
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
              title="View original transcript"
            >
              <FileText className="w-3 h-3" />
              <span>Original</span>
            </button>

            {/* View 2: Translated */}
            <button
              id="view-mode-translated-btn"
              type="button"
              onClick={() => onChangeViewMode('translated')}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'translated'
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
              title={`View ${translatedData.targetLanguage.name} translation`}
            >
              <span>{translatedData.targetLanguage.flag}</span>
              <span>Translated</span>
            </button>

            {/* View 3: Side-by-Side (Bilingual) */}
            <button
              id="view-mode-bilingual-btn"
              type="button"
              onClick={() => onChangeViewMode('side-by-side')}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'side-by-side'
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
              title="View both Original and Translated side-by-side"
            >
              <Columns2 className="w-3 h-3 text-indigo-600" />
              <span className="hidden xs:inline">Side-by-Side</span>
              <span className="xs:hidden">Dual</span>
            </button>
          </div>

          {/* Quick Clear / Reset Translation */}
          <button
            id="clear-translation-btn"
            type="button"
            onClick={onClearTranslation}
            className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/70 rounded-lg transition-colors cursor-pointer"
            title="Clear translation"
            aria-label="Clear translation"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
