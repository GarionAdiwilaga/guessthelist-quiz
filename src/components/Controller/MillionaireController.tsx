import React, { useState, useMemo } from 'react';
import {
  MillionaireQuestion,
  MillionaireState,
  WSMessage
} from '../../types/quiz';
import { getCorrectOptionIndex } from '../MainDisplay/MillionaireBoard';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Lightbulb,
  Lock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  BookOpen,
  Check,
  Tv,
  Table,
  ChevronDown,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

interface MillionaireControllerProps {
  millionaireState?: MillionaireState;
  millionaireQuestions?: MillionaireQuestion[];
  sendMessage: (msg: WSMessage) => void;
  showTitleScreen?: boolean;
  onToggleTitleScreen?: () => void;
}

const CATEGORY_TABS = [
  'Semua',
  'Anime Populer',
  'Shounen Pillars & Classics',
  'Anime Umum',
  'Budaya Wibu & Istilah Otaku'
];

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export function getPageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | '...')[] = [];
  pages.push(1);
  if (currentPage > 3) {
    pages.push('...');
  }
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  if (currentPage < totalPages - 2) {
    pages.push('...');
  }
  pages.push(totalPages);
  return pages;
}

export const MillionaireController: React.FC<MillionaireControllerProps> = ({
  millionaireState,
  millionaireQuestions = [],
  sendMessage,
  showTitleScreen = false,
  onToggleTitleScreen
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isTableExpanded, setIsTableExpanded] = useState<boolean>(true);

  const state: MillionaireState = millionaireState || {
    currentQuestionId: 1,
    selectedOptionIndex: null,
    isLocked: false,
    isRevealed: false,
    showHint: false
  };

  // Find active question or fallback
  const activeQuestion: MillionaireQuestion | null = useMemo(() => {
    if (!millionaireQuestions || millionaireQuestions.length === 0) return null;
    return (
      millionaireQuestions.find((q) => q.id === state.currentQuestionId) ||
      millionaireQuestions[0]
    );
  }, [millionaireQuestions, state.currentQuestionId]);

  const correctOptionIndex = useMemo(() => {
    return getCorrectOptionIndex(activeQuestion);
  }, [activeQuestion]);

  // Filter questions by category and search
  const filteredQuestions: MillionaireQuestion[] = useMemo(() => {
    return millionaireQuestions.filter((q) => {
      const matchCategory =
        selectedCategory === 'Semua' || q.category === selectedCategory;
      if (!matchCategory) return false;

      if (!searchQuery.trim()) return true;

      const qTerm = searchQuery.toLowerCase().trim();
      const matchAnime = q.anime?.toLowerCase().includes(qTerm);
      const matchQuestion = q.question?.toLowerCase().includes(qTerm);
      const matchOptions = q.options?.some((opt) =>
        opt.toLowerCase().includes(qTerm)
      );

      return matchAnime || matchQuestion || matchOptions;
    });
  }, [millionaireQuestions, selectedCategory, searchQuery]);

  // Current question index in filtered list
  const currentFilteredIndex = useMemo(() => {
    if (!activeQuestion) return -1;
    return filteredQuestions.findIndex((q) => q.id === activeQuestion.id);
  }, [filteredQuestions, activeQuestion]);

  // Pagination calculations
  const effectivePageSize = pageSize <= 0 ? (filteredQuestions.length || 1) : pageSize;
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / effectivePageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * effectivePageSize;

  const paginatedQuestions = useMemo(() => {
    if (pageSize <= 0) return filteredQuestions;
    return filteredQuestions.slice(startIndex, startIndex + pageSize);
  }, [filteredQuestions, startIndex, pageSize]);

  // Which page holds the active question
  const activeQuestionPage = useMemo(() => {
    if (!activeQuestion || pageSize <= 0) return 1;
    const idx = filteredQuestions.findIndex((q) => q.id === activeQuestion.id);
    if (idx === -1) return 1;
    return Math.floor(idx / pageSize) + 1;
  }, [filteredQuestions, activeQuestion, pageSize]);

  // Navigation handlers
  const handleSelectQuestion = (id: number) => {
    sendMessage({ type: 'SELECT_MILLIONAIRE_QUESTION', questionId: id });
  };

  const handlePrev = () => {
    if (filteredQuestions.length === 0) return;
    if (currentFilteredIndex > 0) {
      handleSelectQuestion(filteredQuestions[currentFilteredIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (filteredQuestions.length === 0) return;
    if (currentFilteredIndex < filteredQuestions.length - 1) {
      handleSelectQuestion(filteredQuestions[currentFilteredIndex + 1].id);
    }
  };

  const handleRandom = () => {
    if (filteredQuestions.length === 0) return;
    if (filteredQuestions.length === 1) {
      handleSelectQuestion(filteredQuestions[0].id);
      return;
    }
    // Filter out current question to ensure a new one is selected
    const candidates = filteredQuestions.filter(
      (q) => q.id !== activeQuestion?.id
    );
    const chosen =
      candidates[Math.floor(Math.random() * candidates.length)] ||
      filteredQuestions[0];
    handleSelectQuestion(chosen.id);
  };

  // Option selection handler
  const handleOptionClick = (optionIndex: number) => {
    if (state.isRevealed) return; // Prevent changing after result revealed

    if (state.selectedOptionIndex === optionIndex) {
      // Toggle off if clicking the already selected option and not locked
      if (!state.isLocked) {
        sendMessage({
          type: 'HIGHLIGHT_MILLIONAIRE_OPTION',
          optionIndex: null
        });
      }
    } else {
      sendMessage({
        type: 'HIGHLIGHT_MILLIONAIRE_OPTION',
        optionIndex
      });
    }
  };

  // Action button handlers
  const handleToggleHint = () => {
    sendMessage({ type: 'TOGGLE_MILLIONAIRE_HINT' });
  };

  const handleLockAnswer = () => {
    if (state.selectedOptionIndex === null || state.isLocked || state.isRevealed) {
      return;
    }
    sendMessage({ type: 'LOCK_MILLIONAIRE_ANSWER' });
  };

  const handleRevealAnswer = () => {
    if (state.isRevealed || state.selectedOptionIndex === null) {
      return;
    }
    sendMessage({ type: 'REVEAL_MILLIONAIRE_ANSWER' });
  };

  const handleResetQuestion = () => {
    sendMessage({ type: 'RESET_MILLIONAIRE_QUESTION' });
  };

  const isCurrentSelectionCorrect =
    state.selectedOptionIndex !== null &&
    state.selectedOptionIndex === correctOptionIndex;

  if (!millionaireQuestions || millionaireQuestions.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-[#0E143C] border border-[#232F6E] text-center">
        <Sparkles className="w-10 h-10 text-[#00F0FF] mx-auto mb-3 animate-spin" />
        <h3 className="text-lg font-bold text-[#00F0FF]">
          Memuat Bank Soal Quiz Wibu...
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Menghubungkan ke server untuk mengambil daftar 120 pertanyaan.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 select-none">
      {/* Category Tabs & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0E143C] border border-[#232F6E] flex flex-col gap-3 shadow-lg">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
            Kategori:
          </span>
          {CATEGORY_TABS.map((tab) => {
            const count =
              tab === 'Semua'
                ? millionaireQuestions.length
                : millionaireQuestions.filter((q) => q.category === tab).length;
            const isActive = selectedCategory === tab;

            return (
              <button
                key={tab}
                onClick={() => {
                  setSelectedCategory(tab);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-[#00F0FF] text-[#070A1E] font-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : 'bg-[#151D4D] text-gray-300 hover:bg-[#202C70] border border-[#232F6E]'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-[#070A1E]/30 text-[#070A1E]'
                      : 'bg-black/30 text-gray-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Filter Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1 border-t border-[#1C255A]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari judul anime, kata kunci soal, atau pilihan jawaban..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#141B4A] border border-[#2B3980] text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#00F0FF] transition"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs cursor-pointer"
                title="Hapus pencarian"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-400 self-end sm:self-auto">
            <span>
              Ditemukan{' '}
              <strong className="text-[#00F0FF]">
                {filteredQuestions.length}
              </strong>{' '}
              dari {millionaireQuestions.length} soal
            </span>
          </div>
        </div>

        {/* Paginated Quiz Items Table */}
        <div className="pt-2 border-t border-[#1C255A] flex flex-col gap-2.5">
          {/* Table Header Bar & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTableExpanded(!isTableExpanded)}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#141B4A] hover:bg-[#1E2963] border border-[#2B3980] text-xs font-bold text-white transition cursor-pointer"
                title={isTableExpanded ? 'Sembunyikan tabel pilihan soal' : 'Buka tabel pilihan soal'}
              >
                <Table className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>Tabel Pilihan Soal</span>
                {isTableExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>

              <span className="text-[11px] text-gray-400 font-medium">
                Halaman <strong className="text-[#00F0FF]">{safeCurrentPage}</strong> dari{' '}
                <strong className="text-white">{totalPages}</strong>
              </span>

              {activeQuestion && activeQuestionPage !== safeCurrentPage && (
                <button
                  type="button"
                  onClick={() => setCurrentPage(activeQuestionPage)}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 border border-[#00F0FF]/40 text-[#00F0FF] transition cursor-pointer flex items-center space-x-1"
                  title={`Lompat ke halaman ${activeQuestionPage} yang memuat soal #${activeQuestion.id}`}
                >
                  <span>🎯 Ke Halaman Soal Aktif (#{activeQuestion.id})</span>
                </button>
              )}
            </div>

            {/* Per-Page Selector */}
            <div className="flex items-center space-x-1.5 text-xs text-gray-400">
              <span className="text-[11px]">Tampilkan:</span>
              <div className="flex items-center space-x-1 bg-[#101740] p-0.5 rounded-lg border border-[#232F6E]">
                {[5, 10, 20, 50, 0].map((size) => {
                  const label = size === 0 ? 'Semua' : String(size);
                  const isSelected = pageSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setPageSize(size);
                        setCurrentPage(1);
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#00F0FF] text-[#070A1E] font-black'
                          : 'text-gray-300 hover:text-white'
                      }`}
                      title={size === 0 ? 'Tampilkan semua soal tanpa batasan halaman' : `Tampilkan ${size} soal per halaman`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Table Content */}
          {isTableExpanded && (
            <div className="flex flex-col gap-2">
              <div className="w-full overflow-x-auto rounded-xl border border-[#232F6E] bg-[#0A0E2A]">
                <table className="w-full text-left border-collapse min-w-[640px]">
                  <thead>
                    <tr className="bg-[#0E143C] text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#232F6E]">
                      <th className="py-2.5 px-3 w-16 text-center">#ID</th>
                      <th className="py-2.5 px-3 w-40">Anime</th>
                      <th className="py-2.5 px-3">Pertanyaan</th>
                      <th className="py-2.5 px-3 w-36">Kategori</th>
                      <th className="py-2.5 px-3 w-36">Kunci Jawaban</th>
                      <th className="py-2.5 px-3 w-28 text-center">Aksi / Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C255A]/60 text-xs">
                    {paginatedQuestions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400">
                          Tidak ada soal yang cocok dengan filter atau kata kunci pencarian.
                        </td>
                      </tr>
                    ) : (
                      paginatedQuestions.map((q) => {
                        const isActive = activeQuestion?.id === q.id;
                        return (
                          <tr
                            key={q.id}
                            onClick={() => handleSelectQuestion(q.id)}
                            className={`transition-colors cursor-pointer group ${
                              isActive
                                ? 'bg-[#00F0FF]/15 hover:bg-[#00F0FF]/20 text-white font-semibold'
                                : 'hover:bg-[#151D4D] text-gray-300'
                            }`}
                          >
                            <td className="py-2 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                                  isActive
                                    ? 'bg-[#00F0FF] text-[#070A1E] font-black'
                                    : 'bg-[#141B4A] text-[#00F0FF] border border-[#2B3980]'
                                }`}
                              >
                                #{q.id}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <span className="font-bold text-[#FF2E93] group-hover:brightness-125 line-clamp-1">
                                {q.anime}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <p className="line-clamp-1 max-w-md text-gray-200 group-hover:text-white" title={q.question}>
                                {q.question}
                              </p>
                            </td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded bg-[#101740] border border-[#232F6E] text-[10px] text-gray-300 whitespace-nowrap">
                                {q.category}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold text-[10px] truncate max-w-[140px] inline-block" title={q.answer}>
                                ✓ {q.answer}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center">
                              {isActive ? (
                                <span className="px-2.5 py-0.5 rounded-md bg-[#00F0FF] text-[#070A1E] font-black text-[10px] shadow-[0_0_8px_rgba(0,240,255,0.6)]">
                                  AKTIF
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectQuestion(q.id);
                                  }}
                                  className="px-2.5 py-0.5 rounded-md bg-[#1C2555] hover:bg-[#2A377D] text-[#00F0FF] border border-[#304192] text-[10px] font-bold transition cursor-pointer"
                                >
                                  Pilih
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Navigation Footer */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-xs">
                  <span className="text-[11px] text-gray-400">
                    Menampilkan{' '}
                    <strong className="text-white">
                      {filteredQuestions.length === 0 ? 0 : startIndex + 1}
                    </strong>
                    {' '}-{' '}
                    <strong className="text-white">
                      {Math.min(startIndex + effectivePageSize, filteredQuestions.length)}
                    </strong>{' '}
                    dari <strong className="text-[#00F0FF]">{filteredQuestions.length}</strong> soal
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(1)}
                      disabled={safeCurrentPage <= 1}
                      className="p-1.5 rounded-lg bg-[#141B4A] hover:bg-[#1E2963] disabled:opacity-30 disabled:cursor-not-allowed border border-[#2B3980] text-gray-300 transition cursor-pointer"
                      title="Halaman Pertama"
                    >
                      <ChevronsLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={safeCurrentPage <= 1}
                      className="p-1.5 rounded-lg bg-[#141B4A] hover:bg-[#1E2963] disabled:opacity-30 disabled:cursor-not-allowed border border-[#2B3980] text-gray-300 transition cursor-pointer"
                      title="Halaman Sebelumnya"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center space-x-1 px-1">
                      {getPageNumbers(safeCurrentPage, totalPages).map((p, idx) => {
                        if (p === '...') {
                          return (
                            <span key={`ellipsis-${idx}`} className="px-1 text-gray-500 text-xs">
                              ...
                            </span>
                          );
                        }
                        const isCur = p === safeCurrentPage;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setCurrentPage(Number(p))}
                            className={`min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                              isCur
                                ? 'bg-[#00F0FF] text-[#070A1E] font-black shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                                : 'bg-[#141B4A] hover:bg-[#1E2963] text-gray-300 border border-[#2B3980]'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safeCurrentPage >= totalPages}
                      className="p-1.5 rounded-lg bg-[#141B4A] hover:bg-[#1E2963] disabled:opacity-30 disabled:cursor-not-allowed border border-[#2B3980] text-gray-300 transition cursor-pointer"
                      title="Halaman Berikutnya"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={safeCurrentPage >= totalPages}
                      className="p-1.5 rounded-lg bg-[#141B4A] hover:bg-[#1E2963] disabled:opacity-30 disabled:cursor-not-allowed border border-[#2B3980] text-gray-300 transition cursor-pointer"
                      title="Halaman Terakhir"
                    >
                      <ChevronsRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>


      {/* Question Navigation Bar & Quick Selector */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0E143C] border border-[#232F6E] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
        {/* Navigation Buttons: Prev, Next, Random */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrev}
            disabled={currentFilteredIndex <= 0}
            className="flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-[#1C2555] hover:bg-[#2A377D] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white transition-all cursor-pointer border border-[#304192]"
            title="Soal Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4 text-[#00F0FF]" />
            <span>Prev</span>
          </button>

          <button
            onClick={handleRandom}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#7928CA] to-[#FF0080] hover:brightness-110 text-xs font-black text-white transition-all cursor-pointer shadow-[0_0_12px_rgba(255,0,128,0.4)] active:scale-95"
            title="Pilih Soal Acak (Random)"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Soal Acak</span>
          </button>

          <button
            onClick={handleNext}
            disabled={
              currentFilteredIndex < 0 ||
              currentFilteredIndex >= filteredQuestions.length - 1
            }
            className="flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-[#1C2555] hover:bg-[#2A377D] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white transition-all cursor-pointer border border-[#304192]"
            title="Soal Berikutnya"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4 text-[#00F0FF]" />
          </button>
        </div>

        {/* Dropdown Selector */}
        <div className="flex-1 max-w-xl">
          <select
            value={activeQuestion?.id ?? ''}
            onChange={(e) => handleSelectQuestion(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-[#141B4A] border border-[#2B3980] text-xs text-white focus:outline-none focus:border-[#00F0FF] transition cursor-pointer"
          >
            {filteredQuestions.map((q) => (
              <option key={q.id} value={q.id}>
                #{q.id} • {q.anime} : {q.question.slice(0, 50)}
                {q.question.length > 50 ? '...' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Title Screen Quick Toggle if provided */}
        {onToggleTitleScreen && (
          <button
            onClick={onToggleTitleScreen}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
              showTitleScreen
                ? 'bg-[#00F0FF] text-[#0A0D26] border-white shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                : 'bg-[#1C2555] hover:bg-[#2A377D] text-[#00F0FF] border-[#304192]'
            }`}
            title={
              showTitleScreen
                ? 'Kembali ke Layar Game Quiz'
                : 'Transisi ke Layar Judul (Pause)'
            }
          >
            <Tv className="w-4 h-4" />
            <span>{showTitleScreen ? 'Buka Quiz Board' : 'Layar Judul'}</span>
          </button>
        )}
      </div>

      {/* Active Question Preview & Host Cheat Sheet Card */}
      {activeQuestion && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0F2F] border-2 border-[#1E2656] shadow-xl flex flex-col gap-4">
          {/* Header row: ID, Anime, Category, and Status Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[#1C255A]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] font-black text-xs font-mono">
                Soal #{activeQuestion.id} / {millionaireQuestions.length}
              </span>
              <span className="px-3 py-1 rounded-lg bg-[#FF2E93]/15 border border-[#FF2E93]/40 text-[#FF2E93] font-bold text-xs">
                {activeQuestion.anime}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#141B4A] border border-[#2B3980] text-gray-300 text-xs">
                {activeQuestion.category}
              </span>
            </div>

            {/* Current Question Live Status Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {state.showHint && (
                <span className="px-2.5 py-1 rounded-lg bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 font-bold text-xs flex items-center space-x-1 animate-pulse">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Petunjuk Aktif di Layar</span>
                </span>
              )}

              {state.isRevealed ? (
                <span
                  className={`px-2.5 py-1 rounded-lg font-black text-xs flex items-center space-x-1 border ${
                    isCurrentSelectionCorrect
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                      : 'bg-red-500/20 text-red-400 border-red-500/50'
                  }`}
                >
                  {isCurrentSelectionCorrect ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>
                    Hasil:{' '}
                    {isCurrentSelectionCorrect ? 'BENAR (WIN)' : 'SALAH (LOSE)'}
                  </span>
                </span>
              ) : state.isLocked ? (
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 font-black text-xs flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Terkunci (Final Answer)</span>
                </span>
              ) : state.selectedOptionIndex !== null ? (
                <span className="px-2.5 py-1 rounded-lg bg-[#00F0FF]/20 border border-[#00F0FF]/50 text-[#00F0FF] font-bold text-xs">
                  Pilihan Kontestan: [
                  {OPTION_LETTERS[state.selectedOptionIndex] || String.fromCharCode(65 + state.selectedOptionIndex)}]
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 text-xs">
                  Menunggu Pilihan Kontestan
                </span>
              )}
            </div>
          </div>

          {/* Question Text */}
          <div className="bg-[#070A1E] p-4 rounded-xl border border-[#1A2355]">
            <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
              {activeQuestion.question}
            </p>
          </div>

          {/* 4 Option Buttons (A, B, C, D) with Cheat Sheet Badge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeQuestion.options.map((opt, idx) => {
              const letter = OPTION_LETTERS[idx] || String.fromCharCode(65 + idx);
              const isCorrect = idx === correctOptionIndex;
              const isSelected = state.selectedOptionIndex === idx;

              // Compute button styling
              let borderStyle = 'border-[#232F6E]';
              let bgStyle = 'bg-[#101740] hover:bg-[#1A2566]';
              let textStyle = 'text-gray-100';

              if (state.isRevealed) {
                if (isCorrect) {
                  borderStyle =
                    'border-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.4)]';
                  bgStyle = 'bg-emerald-950/60';
                  textStyle = 'text-emerald-300 font-bold';
                } else if (isSelected) {
                  borderStyle =
                    'border-red-500 shadow-[0_0_16px_rgba(239,68,68,0.4)]';
                  bgStyle = 'bg-red-950/60';
                  textStyle = 'text-red-300';
                } else {
                  bgStyle = 'bg-[#0A0E2A] opacity-60';
                }
              } else if (isSelected) {
                if (state.isLocked) {
                  borderStyle =
                    'border-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.5)]';
                  bgStyle = 'bg-amber-950/60';
                  textStyle = 'text-amber-200 font-bold';
                } else {
                  borderStyle =
                    'border-[#00F0FF] shadow-[0_0_16px_rgba(0,240,255,0.4)]';
                  bgStyle = 'bg-[#00F0FF]/15';
                  textStyle = 'text-[#00F0FF] font-bold';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={state.isRevealed}
                  className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all cursor-pointer text-left ${borderStyle} ${bgStyle} ${
                    state.isRevealed ? 'cursor-default' : 'active:scale-[0.99]'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0 pr-2">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                        isSelected
                          ? state.isLocked
                            ? 'bg-amber-400 text-black'
                            : 'bg-[#00F0FF] text-black'
                          : isCorrect
                          ? 'bg-emerald-500 text-black'
                          : 'bg-[#1E2963] text-gray-300'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className={`text-xs sm:text-sm truncate ${textStyle}`}>
                      {opt}
                    </span>
                  </div>

                  {/* Cheat sheet indicators */}
                  <div className="flex items-center space-x-1.5 shrink-0">
                    {isCorrect && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/25 text-emerald-400 border border-emerald-500/50 flex items-center space-x-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>BENAR</span>
                      </span>
                    )}
                    {isSelected && !state.isRevealed && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          state.isLocked
                            ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50'
                            : 'bg-[#00F0FF]/25 text-[#00F0FF] border border-[#00F0FF]/50'
                        }`}
                      >
                        {state.isLocked ? 'TERKUNCI' : 'PILIHAN'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Control Buttons: Hint, Lock, Reveal, Reset */}
          <div className="p-3.5 rounded-xl bg-[#0E143C] border border-[#232F6E] flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              {/* Hint Toggle Button */}
              <button
                onClick={handleToggleHint}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 ${
                  state.showHint
                    ? 'bg-yellow-400 text-black border-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.5)] font-black'
                    : 'bg-[#1C2555] hover:bg-[#2A377D] text-yellow-300 border-[#304192]'
                }`}
                title={
                  state.showHint
                    ? 'Tutup petunjuk dari layar'
                    : 'Tampilkan banner petunjuk di layar display'
                }
              >
                <Lightbulb className="w-4 h-4 fill-current" />
                <span>
                  {state.showHint ? 'Tutup Petunjuk' : 'Tampilkan Petunjuk'}
                </span>
              </button>

              {/* Lock Answer Button */}
              <button
                onClick={handleLockAnswer}
                disabled={
                  state.selectedOptionIndex === null ||
                  state.isLocked ||
                  state.isRevealed
                }
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 ${
                  state.isLocked
                    ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] font-black cursor-default'
                    : state.selectedOptionIndex === null
                    ? 'bg-[#1C2555] opacity-40 border-[#304192] text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black border-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                }`}
                title="Kunci jawaban kontestan (SFX Spacebar Lock)"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {state.isLocked ? 'Jawaban Terkunci' : 'Kunci Jawaban'}
                </span>
              </button>

              {/* Reveal Answer Button */}
              <button
                onClick={handleRevealAnswer}
                disabled={state.isRevealed || state.selectedOptionIndex === null}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md active:scale-95 ${
                  state.isRevealed
                    ? 'bg-emerald-600 text-white border border-emerald-400 cursor-default opacity-80'
                    : state.selectedOptionIndex === null
                    ? 'bg-[#1C2555] opacity-40 border border-[#304192] text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] hover:brightness-110 text-[#050B20] shadow-[0_0_16px_rgba(0,240,255,0.5)]'
                }`}
                title="Buka hasil jawaban (SFX Benar / Buzzer)"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {state.isRevealed ? 'Hasil Terbuka' : 'Buka Hasil (Reveal)'}
                </span>
              </button>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetQuestion}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-300 border border-gray-600 transition-all cursor-pointer active:scale-95"
              title="Reset pilihan, status kunci, dan hasil pada soal ini"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Pilihan</span>
            </button>
          </div>

          {/* Host Cheat Sheet: Hint Preview & Trivia Explanation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Hint Box */}
            <div className="p-3.5 rounded-xl bg-[#0E1540] border border-[#232F6E]">
              <div className="flex items-center justify-between text-xs text-yellow-300 font-bold mb-1">
                <div className="flex items-center space-x-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Petunjuk Soal (Display Clue)</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-black ${
                    state.showHint
                      ? 'bg-yellow-400/20 text-yellow-300'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {state.showHint ? 'Aktif di Display' : 'Tersembunyi'}
                </span>
              </div>
              <p className="text-xs text-gray-300 italic">
                {activeQuestion.hint
                  ? `"${activeQuestion.hint}"`
                  : 'Tidak ada petunjuk khusus untuk soal ini.'}
              </p>
            </div>

            {/* Explanation / Trivia Box */}
            <div className="p-3.5 rounded-xl bg-[#0E1540] border border-[#232F6E]">
              <div className="flex items-center justify-between text-xs text-[#00F0FF] font-bold mb-1">
                <div className="flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Kunci Jawaban & Fakta Trivia</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  {OPTION_LETTERS[correctOptionIndex] || (correctOptionIndex >= 0 ? String.fromCharCode(65 + correctOptionIndex) : '?')}: {activeQuestion.answer}
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {activeQuestion.explanation ||
                  'Tidak ada penjelasan tambahan untuk soal ini.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
