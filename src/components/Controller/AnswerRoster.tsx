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

  return (
    <div className="w-full flex flex-col space-y-3">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-bold text-[#FFD600] tracking-wider uppercase">
          DAFTAR JAWABAN (TOP 10):
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

      {/* Answer Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {sortedItems.map((item) => {
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
              isRevealed={isRevealed}
              isHighlighted={isHighlighted}
              onToggleReveal={onToggleReveal}
            />
          );
        })}
      </div>
    </div>
  );
};
