import React, { useState, useMemo } from 'react';
import {
  History,
  X,
  Search,
  Trash2,
  ExternalLink,
  Copy,
  Download,
  ArrowRight,
  Clock,
  FileText,
  Check,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { HistoryItem, TranscriptResponse } from '../types';
import { formatTimeAgo } from '../utils/historyStorage';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onQuickCopy: (item: HistoryItem) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onRemove,
  onClearAll,
  onQuickCopy,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase();
    return history.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.snippet.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  const totalWords = useMemo(() => {
    return history.reduce((sum, item) => sum + (item.wordCount || 0), 0);
  }, [history]);

  const handleCopyClick = (item: HistoryItem) => {
    onQuickCopy(item);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-['Poppins',sans-serif]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs"
          />

          {/* Slide-over panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-zinc-200/80"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-zinc-200/80 bg-zinc-50/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-xs">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                      Transcript History
                      <span className="px-2 py-0.5 rounded-full bg-zinc-200/80 text-[11px] font-semibold text-zinc-700">
                        {history.length}
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Locally saved transcripts on this device
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-xl transition-colors cursor-pointer"
                  aria-label="Close history drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stats & Search Bar */}
              <div className="p-4 border-b border-zinc-100 bg-white space-y-3">
                {/* Search */}
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 absolute left-3 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search saved transcripts..."
                    className="w-full pl-9 pr-8 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 p-1 text-zinc-400 hover:text-zinc-600 rounded-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Micro stats banner */}
                {history.length > 0 && (
                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                    <div className="flex items-center gap-2">
                      <span>
                        <strong className="text-zinc-800">{history.length}</strong> videos saved
                      </span>
                      <span>•</span>
                      <span>
                        <strong className="text-zinc-800">{totalWords.toLocaleString()}</strong> words
                      </span>
                    </div>

                    {!showClearConfirm ? (
                      <button
                        type="button"
                        onClick={() => setShowClearConfirm(true)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-red-600 font-semibold">Delete all?</span>
                        <button
                          type="button"
                          onClick={() => {
                            onClearAll();
                            setShowClearConfirm(false);
                          }}
                          className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowClearConfirm(false)}
                          className="text-[11px] text-zinc-500 hover:text-zinc-800"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-400 mx-auto mb-3">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-800">
                      {searchQuery ? 'No matching transcripts found' : 'No history yet'}
                    </h3>
                    <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1 leading-relaxed">
                      {searchQuery
                        ? 'Try searching with another keyword or video title.'
                        : 'Transcripts you extract will automatically appear here for instant offline access and re-opening.'}
                    </p>
                  </div>
                ) : (
                  filteredHistory.map((item) => {
                    const isCopied = copiedId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="group p-3.5 bg-zinc-50/70 hover:bg-zinc-50 rounded-2xl border border-zinc-200/80 hover:border-zinc-300 transition-all shadow-2xs hover:shadow-xs flex flex-col gap-2.5"
                      >
                        {/* Top: Thumbnail, Title, Creator */}
                        <div className="flex items-start gap-3">
                          <div className="relative w-20 h-12 bg-zinc-200 rounded-lg overflow-hidden shrink-0 border border-zinc-200">
                            <img
                              src={item.thumbnailUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {item.durationFormatted && (
                              <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/80 text-white font-mono text-[9px] rounded font-medium">
                                {item.durationFormatted}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4
                              onClick={() => {
                                onSelect(item);
                                onClose();
                              }}
                              className="text-xs sm:text-sm font-semibold text-zinc-900 hover:text-zinc-600 line-clamp-2 cursor-pointer transition-colors leading-snug"
                              title={item.title}
                            >
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500">
                              <span className="truncate max-w-[120px] font-medium">{item.author}</span>
                              <span>•</span>
                              <span>{formatTimeAgo(item.fetchedAt)}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemove(item.id)}
                            className="text-zinc-400 hover:text-red-600 p-1 rounded-md opacity-70 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Remove from history"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Snippet preview */}
                        {item.snippet && (
                          <p className="text-[11px] text-zinc-600 line-clamp-2 italic bg-white/70 p-2 rounded-lg border border-zinc-200/60 leading-relaxed font-mono">
                            "{item.snippet}"
                          </p>
                        )}

                        {/* Bottom: Meta tags & Quick action buttons */}
                        <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-zinc-200/70 text-zinc-700 text-[10px] font-medium">
                              {item.language}
                            </span>
                            <span className="text-[11px] text-zinc-500 font-medium">
                              {item.wordCount.toLocaleString()} words
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyClick(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors cursor-pointer"
                              title="Copy full text to clipboard"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-zinc-500" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onSelect(item);
                                onClose();
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer shadow-2xs"
                            >
                              <span>Open</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer info */}
              <div className="p-4 border-t border-zinc-200/80 bg-zinc-50/70 text-center text-xs text-zinc-500">
                <span>Transcripts are stored safely in your browser storage.</span>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
