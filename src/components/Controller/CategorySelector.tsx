import React from 'react';
import { QuizCategory } from '../../types/quiz';

interface CategorySelectorProps {
  categories: QuizCategory[];
  activeCategoryId: number;
  onSelectCategory: (id: number) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory
}) => {
  return (
    <div className="w-full flex flex-col space-y-2 select-none mb-4">
      <label className="text-xs font-bold text-[#00F0FF] tracking-wider uppercase">
        PILIH KATEGORI QUIZ:
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {categories.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center space-x-3 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'border-[#00F0FF] bg-gradient-to-r from-[#172054] to-[#251A5A] shadow-[0_0_15px_rgba(0,240,255,0.4)] text-white'
                  : 'border-[#1E2756] bg-[#0E1338]/80 text-gray-300 hover:border-[#00F0FF]/50 hover:bg-[#141A4A]'
              }`}
            >
              <span className="text-2xl shrink-0">{cat.emoji || '🎯'}</span>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-[#FFD600] uppercase block">
                  Kategori #{cat.id}
                </span>
                <span className="text-sm font-semibold truncate block leading-snug">
                  {cat.category}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
