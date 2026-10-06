import React from 'react';
import { QuizState, QuizCategory, WSMessage } from '../../types/quiz';
import { CategorySelector } from './CategorySelector';
import { AnswerRoster } from './AnswerRoster';

interface ControllerViewProps {
  state: QuizState;
  categories: QuizCategory[];
  sendMessage: (msg: WSMessage) => void;
}

export const ControllerView: React.FC<ControllerViewProps> = ({
  state,
  categories,
  sendMessage
}) => {
  const currentCategory =
    categories.find((c) => c.id === state.categoryId) || categories[0];

  const handleSelectCategory = (categoryId: number) => {
    sendMessage({ type: 'SELECT_CATEGORY', categoryId });
  };

  const handleToggleReveal = (itemId: number) => {
    if (state.revealedItemIds.includes(itemId)) {
      sendMessage({ type: 'HIDE_ITEM', itemId });
    } else {
      sendMessage({ type: 'REVEAL_ITEM', itemId });
    }
  };

  return (
    <div className="min-h-screen bg-[#070A1E] text-white p-4 md:p-6 max-w-7xl mx-auto flex flex-col space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E2656] gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#00F0FF] tracking-wide font-['Outfit',sans-serif]">
            PANEL KONTROL HOST • FAMILY WIBU 100
          </h1>
          <p className="text-xs text-gray-400">
            Kendali layar utama, reveal jawaban, buzzer salah & manajemen ronde.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs px-2.5 py-1 rounded bg-[#0E1540] border border-[#00F0FF]/40 text-[#00F0FF] font-semibold">
            {state.revealedItemIds.length} / {currentCategory?.items.length || 10} Terbuka
          </span>
        </div>
      </header>

      {/* Category Tabs */}
      <CategorySelector
        categories={categories}
        activeCategoryId={state.categoryId}
        onSelectCategory={handleSelectCategory}
      />

      {/* Answer Roster with Live Search */}
      <AnswerRoster
        items={currentCategory?.items || []}
        revealedItemIds={state.revealedItemIds}
        onToggleReveal={handleToggleReveal}
      />
    </div>
  );
};
