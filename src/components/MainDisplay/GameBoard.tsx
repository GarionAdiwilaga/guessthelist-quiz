import React from 'react';
import { QuizItem } from '../../types/quiz';
import { FlipCard } from './FlipCard';

interface GameBoardProps {
  items: QuizItem[];
  revealedItemIds: number[];
}

export const GameBoard: React.FC<GameBoardProps> = ({ items, revealedItemIds }) => {
  // Sort items by rank 1..10 (used as stable slot ordering)
  const sortedItems = [...items].sort((a, b) => a.rank - b.rank);
  const leftCol = sortedItems.slice(0, 5);
  const rightCol = sortedItems.slice(5, 10);

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5 lg:gap-3 px-2 sm:px-4">
      {/* Left Column (Slots 1 - 5) */}
      <div className="flex flex-col space-y-1.5 sm:space-y-2">
        {leftCol.map((item, index) => {
          const isRevealed = revealedItemIds.includes(item.id);
          return (
            <FlipCard
              key={item.id}
              item={item}
              slotIndex={index}
              isRevealed={isRevealed}
            />
          );
        })}
      </div>

      {/* Right Column (Slots 6 - 10) */}
      <div className="flex flex-col space-y-1.5 sm:space-y-2">
        {rightCol.map((item, index) => {
          const isRevealed = revealedItemIds.includes(item.id);
          return (
            <FlipCard
              key={item.id}
              item={item}
              slotIndex={index + 5}
              isRevealed={isRevealed}
            />
          );
        })}
      </div>
    </div>
  );
};
