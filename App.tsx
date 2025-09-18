import React, { useState, useCallback } from 'react';
import { View, AppState, PromptTemplate, HistoryItem } from './types';
import Dashboard from './views/Dashboard';
import Workspace from './views/Workspace';
import IdeaWall from './views/IdeaWall';
import TemplateLibrary from './views/TemplateLibrary';
import Header from './components/Header';
import HistoryView from './views/History';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    currentView: View.Dashboard,
  });

  const navigateTo = useCallback((view: View, payload?: string | PromptTemplate | HistoryItem) => {
    setAppState({ currentView: view, payload });
  }, []);

  const renderView = () => {
    switch (appState.currentView) {
      case View.Dashboard:
        return <Dashboard navigateTo={navigateTo} />;
      case View.Workspace:
        const initialIdea = typeof appState.payload === 'string' ? appState.payload : undefined;
        const template = (typeof appState.payload === 'object' && 'category' in appState.payload) ? appState.payload as PromptTemplate : undefined;
        const historyItem = (typeof appState.payload === 'object' && 'createdAt' in appState.payload) ? appState.payload as HistoryItem : undefined;
        return <Workspace navigateTo={navigateTo} initialIdea={initialIdea} template={template} historyItem={historyItem} />;
      case View.IdeaWall:
        return <IdeaWall navigateTo={navigateTo} />;
      case View.TemplateLibrary:
        return <TemplateLibrary navigateTo={navigateTo} />;
      case View.History:
        return <HistoryView navigateTo={navigateTo as (view: View, payload?: HistoryItem) => void} />;
      default:
        return <Dashboard navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text font-sans">
      <Header onLogoClick={() => navigateTo(View.Dashboard)} />
      <main className="p-4 sm:p-8">
        {renderView()}
      </main>
    </div>
  );
};

export default App;