import React from 'react';
import { QuizItem } from '../../types/quiz';
import { FlipCard } from './FlipCard';

interface GameBoardProps {
  items: QuizItem[];
  revealedItemIds: number[];
}

export const GameBoard: React.FC<GameBoardProps> = ({ items, revealedItemIds }) => {
  // Sort items by rank 1..10
  const sortedItems = [...items].sort((a, b) => a.rank - b.rank);
  const leftCol = sortedItems.slice(0, 5);
  const rightCol = sortedItems.slice(5, 10);

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-4">
      {/* Left Column (Slots 1 - 5) */}
      <div className="flex flex-col space-y-3 md:space-y-4">
        {leftCol.map((item, index) => {
          const slotNumber = index + 1;
          const isRevealed = revealedItemIds.includes(item.id);
          return (
            <FlipCard
              key={item.id}
              item={item}
              slotNumber={slotNumber}
              isRevealed={isRevealed}
            />
          );
        })}
      </div>

      {/* Right Column (Slots 6 - 10) */}
      <div className="flex flex-col space-y-3 md:space-y-4">
        {rightCol.map((item, index) => {
          const slotNumber = index + 6;
          const isRevealed = revealedItemIds.includes(item.id);
          return (
            <FlipCard
              key={item.id}
              item={item}
              slotNumber={slotNumber}
              isRevealed={isRevealed}
            />
          );
        })}
      </div>
    </div>
  );
};
