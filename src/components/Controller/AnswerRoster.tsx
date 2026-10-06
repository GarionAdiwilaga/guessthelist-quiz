import React, { useState, useMemo } from 'react';
import { QuizItem } from '../../types/quiz';
import { AnswerCard } from './AnswerCard';
import { Search, X } from 'lucide-react';

interface AnswerRosterProps {
  items: QuizItem[];
  revealedItemIds: number[];
  onToggleReveal: (id: number) => void;
}

export const AnswerRoster: React.FC<AnswerRosterProps> = ({
  items,
  revealedItemIds,
  onToggleReveal
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.rank - b.rank);
  }, [items]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const leftCol = sortedItems.slice(0, 5);
  const rightCol = sortedItems.slice(5, 10);

  return (
    <div className="w-full flex flex-col space-y-3">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-bold text-[#FFD600] tracking-wider uppercase">
          DAFTAR 10 JAWABAN (LAYOUT SESUAI DISPLAY UTAMA):
        </label>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari karakter / anime / alias..."
            className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-[#0E1338] border border-[#242E64] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Answer Cards 2-Column Grid Directly Mirroring Main Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Left Column (Slots 1 - 5) */}
        <div className="flex flex-col space-y-2">
          <div className="text-[11px] font-black tracking-wider text-[#00F0FF]/80 uppercase px-1 flex items-center justify-between">
            <span>Kolom Kiri (Slot 1 – 5)</span>
            <span className="text-[10px] text-gray-500 font-mono">1 2 3 4 5 ↓</span>
          </div>
          {leftCol.map((item, index) => {
            const isRevealed = revealedItemIds.includes(item.id);
            const isHighlighted =
              normalizedQuery.length > 0 &&
              (item.answer.toLowerCase().includes(normalizedQuery) ||
                (item.anime && item.anime.toLowerCase().includes(normalizedQuery)) ||
                (item.aliases &&
                  item.aliases.some((a) => a.toLowerCase().includes(normalizedQuery))));

            return (
              <AnswerCard
                key={item.id}
                item={item}
                index={index}
                isRevealed={isRevealed}
                isHighlighted={isHighlighted}
                onToggleReveal={onToggleReveal}
              />
            );
          })}
        </div>

        {/* Right Column (Slots 6 - 10) */}
        <div className="flex flex-col space-y-2">
          <div className="text-[11px] font-black tracking-wider text-[#00F0FF]/80 uppercase px-1 flex items-center justify-between">
            <span>Kolom Kanan (Slot 6 – 10)</span>
            <span className="text-[10px] text-gray-500 font-mono">6 7 8 9 10 ↓</span>
          </div>
          {rightCol.map((item, index) => {
            const slotIndex = index + 5;
            const isRevealed = revealedItemIds.includes(item.id);
            const isHighlighted =
              normalizedQuery.length > 0 &&
              (item.answer.toLowerCase().includes(normalizedQuery) ||
                (item.anime && item.anime.toLowerCase().includes(normalizedQuery)) ||
                (item.aliases &&
                  item.aliases.some((a) => a.toLowerCase().includes(normalizedQuery))));

            return (
              <AnswerCard
                key={item.id}
                item={item}
                index={slotIndex}
                isRevealed={isRevealed}
                isHighlighted={isHighlighted}
                onToggleReveal={onToggleReveal}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
