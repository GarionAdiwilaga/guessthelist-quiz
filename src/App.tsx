import React, { useEffect, useState } from 'react';
import { QuizState, QuizCategory, WSMessage } from './types/quiz';
import { socketClient } from './services/socket';
import { MainDisplay } from './components/MainDisplay/MainDisplay';
import { ControllerView } from './components/Controller/ControllerView';

export default function App() {
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [state, setState] = useState<QuizState | null>(null);
  const [currentPath, setCurrentPath] = useState(
    window.location.pathname + window.location.hash
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.hash);
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = socketClient.subscribe((snapshot) => {
      setState(snapshot.state);
      setCategories(snapshot.categories);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSendMessage = (msg: WSMessage) => {
    socketClient.send(msg);
  };

  if (!state || categories.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#070A1E] text-white">
        <div className="w-12 h-12 rounded-full border-4 border-[#00F0FF] border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-bold text-[#00F0FF] tracking-wider uppercase font-['Outfit',sans-serif]">
          Menghubungkan ke Server Family Wibu 100...
        </p>
      </div>
    );
  }

  const isController =
    currentPath.startsWith('/control') || currentPath.includes('#/control');

  if (isController) {
    return (
      <ControllerView
        state={state}
        categories={categories}
        sendMessage={handleSendMessage}
      />
    );
  }

  return <MainDisplay state={state} categories={categories} />;
}
