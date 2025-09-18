import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, PromptElements, PromptSuggestions, PromptTemplate, HistoryItem } from '../types';
import { generateSuggestionsForIdea, refinePrompt, generateInitialPromptFromIdea, getRealtimeSuggestion } from '../services/geminiService';
import { saveHistoryItem } from '../services/historyService';
import Accordion from '../components/Accordion';
import Button from '../components/Button';
import Loader from '../components/Loader';

const SparkleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L9.5 8.5L4 11L9.5 13.5L12 19L14.5 13.5L20 11L14.5 8.5L12 3z"/></svg>
);

interface WorkspaceProps {
  navigateTo: (view: View, payload?: string | PromptTemplate | HistoryItem) => void;
  initialIdea?: string;
  template?: PromptTemplate;
  historyItem?: HistoryItem;
}

const Workspace: React.FC<WorkspaceProps> = ({ navigateTo, initialIdea = '', template, historyItem }) => {
  const [idea, setIdea] = useState(initialIdea);
  const [promptElements, setPromptElements] = useState<PromptElements>({
    role: '', purpose: '', constraints: '', details: ''
  });
  const [suggestions, setSuggestions] = useState<PromptSuggestions | null>(null);
  const [refineSuggestions, setRefineSuggestions] = useState<string[]>([]);
  const [ghostSuggestion, setGhostSuggestion] = useState<string>('');
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingRefinement, setIsLoadingRefinement] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'refine' | 'cycle'>('refine');
  const [historyId, setHistoryId] = useState<string | undefined>();

  const handleProcessIdea = useCallback(async (ideaToProcess: string) => {
    if (!ideaToProcess) {
      setError('まず、あなたのアイデアを入力してください。');
      return;
    }
    setError('');
    setIsLoadingSuggestions(true);
    setSuggestions(null);
    setPromptElements({ role: '', purpose: '', constraints: '', details: '' }); // Reset
    try {
      const [suggestionsResult, initialPromptResult] = await Promise.all([
        generateSuggestionsForIdea(ideaToProcess),
        generateInitialPromptFromIdea(ideaToProcess)
      ]);
      setSuggestions(suggestionsResult);
      setPromptElements(prev => ({ ...prev, ...initialPromptResult }));
    } catch (e) {
      setError('AIからの提案の生成に失敗しました。もう一度お試しください。');
      console.error(e);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    if (historyItem) {
        setIdea(historyItem.idea);
        setPromptElements(historyItem.prompt);
        setHistoryId(historyItem.id);
        generateSuggestionsForIdea(historyItem.idea).then(setSuggestions).catch(console.error);
    } else if (template) {
        setIdea(template.description);
        setPromptElements(template.prompt);
        setHistoryId(undefined);
        generateSuggestionsForIdea(template.description).then(setSuggestions).catch(console.error);
    } else if (initialIdea) {
        handleProcessIdea(initialIdea);
        setHistoryId(undefined);
    }
  }, [template, initialIdea, historyItem, handleProcessIdea]);

  const handleElementChange = (key: keyof PromptElements, value: string | ((prev: string) => string)) => {
    setGhostSuggestion(''); // Clear ghost suggestion on manual edit
    setPromptElements(prev => ({
      ...prev,
      [key]: typeof value === 'function' ? value(prev[key]) : value,
    }));
  };

  const finalPrompt = useMemo(() => {
    return [
      `## 役割\n${promptElements.role}`,
      `## 目的\n${promptElements.purpose}`,
      `## 制約条件\n${promptElements.constraints}`,
      `## 詳細\n${promptElements.details}`
    ].filter(part => part.split('\n')[1]?.trim()).join('\n\n');
  }, [promptElements]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!finalPrompt.trim()) return;
      const newHistoryId = saveHistoryItem({
        id: historyId,
        idea: idea,
        prompt: promptElements,
      });
      if (!historyId) {
        setHistoryId(newHistoryId);
      }
    }, 2000);
    return () => clearTimeout(handler);
  }, [finalPrompt, historyId, idea, promptElements]);
  
  useEffect(() => {
    if (!finalPrompt.trim()) {
        setGhostSuggestion('');
        return;
    }

    const handler = setTimeout(async () => {
        if (isLoadingSuggestions || isLoadingRefinement) return;
        try {
            const suggestion = await getRealtimeSuggestion(finalPrompt);
            setGhostSuggestion(suggestion);
        } catch (e) {
            console.error("Failed to get real-time suggestion:", e);
            setGhostSuggestion('');
        }
    }, 1500);

    return () => clearTimeout(handler);
  }, [finalPrompt, isLoadingSuggestions, isLoadingRefinement]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && ghostSuggestion) {
      e.preventDefault();
      handleElementChange('details', prev => {
        const trimmedPrev = prev.trim();
        return trimmedPrev ? `${trimmedPrev}\n${ghostSuggestion}` : ghostSuggestion;
      });
      setGhostSuggestion('');
    }
  };

  const handleRefine = async () => {
      if (!finalPrompt) return;
      setIsLoadingRefinement(true);
      setRefineSuggestions([]);
      try {
          const result = await refinePrompt(finalPrompt);
          setRefineSuggestions(result);
      } catch (e) {
          setError('プロンプトの改善案の生成に失敗しました。');
          console.error(e);
      } finally {
          setIsLoadingRefinement(false);
      }
  };

  const addRefinementToPrompt = (suggestion: string) => {
    handleElementChange('details', prev => `${prev}\n- ${suggestion}`.trim());
  };

  const copyToClipboard = () => {
    const textToCopy = finalPrompt + (ghostSuggestion ? `\n- ${ghostSuggestion}` : '');
    navigator.clipboard.writeText(textToCopy);
    alert('プロンプトをクリップボードにコピーしました！');
  };

  const renderSuggestionButtons = (suggestionsList: string[], key: keyof PromptElements) => (
    <div className="flex flex-wrap gap-2">
      {suggestionsList.map((s, i) => (
        <button
          key={i}
          onClick={() => handleElementChange(key, prev => `${prev}${prev ? '\n' : ''}- ${s}`.trim())}
          className="bg-dark-accent/50 text-white px-3 py-1 rounded-full text-sm hover:bg-dark-accent transition-colors"
        >
          + {s}
        </button>
      ))}
    </div>
  );
  
  const isIdeaEmpty = !idea.trim();

  return (
    <div className="max-w-7xl mx-auto">
       <div className="mb-6">
        <button 
          onClick={() => navigateTo(View.Dashboard)} 
          className="text-dark-accent hover:text-brand-purple transition-colors inline-flex items-center gap-2 group font-semibold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          ダッシュボードに戻る
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" onKeyDown={handleKeyDown}>
        <div className="bg-dark-surface rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-white">1. アイデアの入力</h2>
          <p className="text-gray-400 mb-4">まずはあなたのアイデアの種を教えてください。AIが発想を広げる手助けをします。</p>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="例：未来の都市のイラストを作りたい"
            className="w-full h-24 p-2 bg-dark-card border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-purple focus:outline-none"
          />
          <div className="mt-4 text-center">
            <Button 
              onClick={() => handleProcessIdea(idea)} 
              isLoading={isLoadingSuggestions} 
              disabled={isIdeaEmpty}
              className={!isIdeaEmpty ? 'animate-subtle-pulse' : ''}
            >
              <SparkleIcon/>
              AIとアイデアを具体化する
            </Button>
            <p className="text-xs text-gray-500 mt-2 h-4">
              {isIdeaEmpty ? ' ' : 'AIがあなたのアイデアを分析し、プロンプトの骨格を自動生成します。'}
            </p>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}

          <h2 className="text-2xl font-bold mt-8 mb-4 text-white">2. プロンプトの要素</h2>
          {isLoadingSuggestions && <Loader />}
          {suggestions && (
            <div className="space-y-2">
              <Accordion title="AIへの役割">
                {renderSuggestionButtons(suggestions.roles, 'role')}
                <textarea value={promptElements.role} onChange={e => handleElementChange('role', e.target.value)} className="w-full mt-3 p-2 bg-dark-card border border-gray-600 rounded-md" placeholder="役割を手動で入力..."/>
              </Accordion>
              <Accordion title="目的">
                {renderSuggestionButtons(suggestions.purposes, 'purpose')}
                <textarea value={promptElements.purpose} onChange={e => handleElementChange('purpose', e.target.value)} className="w-full mt-3 p-2 bg-dark-card border border-gray-600 rounded-md" placeholder="目的を手動で入力..."/>
              </Accordion>
              <Accordion title="制約条件">
                {renderSuggestionButtons(suggestions.constraints, 'constraints')}
                 <textarea value={promptElements.constraints} onChange={e => handleElementChange('constraints', e.target.value)} className="w-full mt-3 p-2 bg-dark-card border border-gray-600 rounded-md" placeholder="制約条件を手動で入力..."/>
              </Accordion>
               <Accordion title="詳細・追加情報">
                  <textarea value={promptElements.details} onChange={e => handleElementChange('details', e.target.value)} className="w-full p-2 bg-dark-card border border-gray-600 rounded-md" placeholder="その他、詳細な指示や背景情報を入力..."/>
              </Accordion>
            </div>
          )}
        </div>

        <div className="sticky top-24 h-fit">
          <div className="bg-dark-surface rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">プロンプト・プレビュー</h2>
              <Button onClick={copyToClipboard} variant="secondary" disabled={!finalPrompt}>コピー</Button>
            </div>
            <div className="relative bg-dark-card p-4 rounded-md h-64 overflow-y-auto">
               <pre className="whitespace-pre-wrap text-sm font-mono focus:outline-none" tabIndex={0}>
                  {finalPrompt || 'ここにプロンプトが生成されます...'}
                  {ghostSuggestion && (
                      <span className="text-gray-500 opacity-75">
                          {(finalPrompt.trim() && !finalPrompt.endsWith('\n')) ? '\n' : ''}
                          {ghostSuggestion}
                      </span>
                  )}
              </pre>
              {ghostSuggestion && (
                  <div className="absolute bottom-2 right-2 text-xs text-dark-accent bg-dark-surface/80 px-2 py-1 rounded backdrop-blur-sm">
                      <kbd className="font-sans font-semibold">Enter</kbd>で確定
                  </div>
              )}
            </div>

            <div className="mt-6">
              <div className="flex border-b border-gray-700">
                  <button onClick={() => setActiveTab('refine')} className={`px-4 py-2 font-semibold ${activeTab === 'refine' ? 'text-brand-purple border-b-2 border-brand-purple' : 'text-gray-400'}`}>✨ リファイン</button>
                  <button onClick={() => setActiveTab('cycle')} className={`px-4 py-2 font-semibold ${activeTab === 'cycle' ? 'text-brand-purple border-b-2 border-brand-purple' : 'text-gray-400'}`}>🔁 改善サイクル</button>
              </div>
              <div className="pt-4">
                  {activeTab === 'refine' && (
                      <div>
                          <p className="text-gray-400 mb-4">AIがプロンプト全体を分析し、包括的な改善案を提案します。</p>
                          <Button onClick={handleRefine} isLoading={isLoadingRefinement} disabled={!finalPrompt}>改善案を提案</Button>
                          {isLoadingRefinement && <Loader text="改善案を分析中..."/>}
                          {refineSuggestions.length > 0 && (
                              <ul className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                                  {refineSuggestions.map((s, i) => (
                                      <li key={i} className="flex items-center justify-between bg-dark-card p-2 rounded-md">
                                          <span className="text-sm">{s}</span>
                                          <button onClick={() => addRefinementToPrompt(s)} className="text-xs bg-dark-accent text-white px-2 py-1 rounded hover:bg-dark-accent/80">+</button>
                                      </li>
                                  ))}
                              </ul>
                          )}
                      </div>
                  )}
                  {activeTab === 'cycle' && (
                       <div>
                          <p className="text-gray-400">AIの生成結果が期待通りでなかった場合に、対話形式で改善します。（近日公開）</p>
                      </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workspace;