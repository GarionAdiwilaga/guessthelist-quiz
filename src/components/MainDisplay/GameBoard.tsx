import React from 'react';
import { QuizItem } from '../../types/quiz';
import { FlipCard } from './FlipCard';

interface GameBoardProps {
  items: QuizItem[];
  revealedItemIds: number[];
  clueRollTimestamp?: number | null;
  clueRollTargetItemId?: number | null;
  onRollComplete?: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  items,
  revealedItemIds,
  clueRollTimestamp,
  clueRollTargetItemId,
  onRollComplete
}) => {
  // Sort items by rank 1..10 (used as stable slot ordering)
  const sortedItems = [...items].sort((a, b) => a.rank - b.rank);
  const leftCol = sortedItems.slice(0, 5);
  const rightCol = sortedItems.slice(5, 10);

  const [highlightedSlotIndex, setHighlightedSlotIndex] = React.useState<number | null>(null);
  const prevRollTimestampRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!clueRollTimestamp || clueRollTimestamp === prevRollTimestampRef.current) return;
    prevRollTimestampRef.current = clueRollTimestamp;

    // Find all unrevealed card slot indices
    const unrevealedIndices: number[] = [];
    sortedItems.forEach((it, idx) => {
      if (!revealedItemIds.includes(it.id)) {
        unrevealedIndices.push(idx);
      }
    });

    if (unrevealedIndices.length === 0) return;

    const targetIdx = sortedItems.findIndex((it) => it.id === clueRollTargetItemId);
    const finalLandingIdx = targetIdx !== -1 ? targetIdx : unrevealedIndices[0];

    // Roulette timing: 14 rapid hops -> 5 decelerating hops
    const delays: number[] = [];
    for (let i = 0; i < 14; i++) delays.push(70);
    delays.push(110, 160, 230, 320, 440);

    let step = 0;
    let timer: ReturnType<typeof setTimeout>;

    function runStep() {
      if (step < delays.length) {
        const randomSlot = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
        setHighlightedSlotIndex(randomSlot);
        const delay = delays[step];
        step++;
        timer = setTimeout(runStep, delay);
      } else {
        // Land cleanly on target slot
        setHighlightedSlotIndex(finalLandingIdx);
        timer = setTimeout(() => {
          if (onRollComplete) onRollComplete();
        }, 550);
      }
    }

    runStep();

    return () => {
      clearTimeout(timer);
    };
  }, [clueRollTimestamp, clueRollTargetItemId, revealedItemIds]);

  React.useEffect(() => {
    if (!clueRollTargetItemId) {
      setHighlightedSlotIndex(null);
    }
  }, [clueRollTargetItemId]);

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5 lg:gap-4.5 px-2 sm:px-4">
      {/* Left Column (Slots 1 - 5) */}
      <div className="flex flex-col space-y-2 sm:space-y-2.5 lg:space-y-3">
        {leftCol.map((item, index) => {
          const isRevealed = revealedItemIds.includes(item.id);
          const isHighlighted = highlightedSlotIndex === index;
          return (
            <FlipCard
              key={item.id}
              item={item}
              slotIndex={index}
              isRevealed={isRevealed}
              isHighlighted={isHighlighted}
            />
          );
        })}
      </div>

      {/* Right Column (Slots 6 - 10) */}
      <div className="flex flex-col space-y-2 sm:space-y-2.5 lg:space-y-3">
        {rightCol.map((item, index) => {
          const isRevealed = revealedItemIds.includes(item.id);
          const isHighlighted = highlightedSlotIndex === index + 5;
          return (
            <FlipCard
              key={item.id}
              item={item}
              slotIndex={index + 5}
              isRevealed={isRevealed}
              isHighlighted={isHighlighted}
            />
          );
        })}
      </div>
    </div>
  );
};
