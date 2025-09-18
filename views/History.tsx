import React, { useState, useEffect } from 'react';
import { View, HistoryItem } from '../types';
import { getHistory } from '../services/historyService';
import Button from '../components/Button';

interface HistoryProps {
  navigateTo: (view: View, payload?: HistoryItem) => void;
}

const HistoryView: React.FC<HistoryProps> = ({ navigateTo }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const formatPreview = (prompt: HistoryItem['prompt']) => {
    const parts = [prompt.role, prompt.purpose, prompt.constraints, prompt.details];
    const preview = parts.filter(Boolean).join(' / ');
    return preview.length > 100 ? preview.substring(0, 100) + '...' : preview;
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container mx-auto">
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
      <div className="text-center mb-8">
        <h2 className="text-4xl font-extrabold text-white mb-2">プロンプト履歴</h2>
        <p className="text-lg text-gray-400">過去に作成したプロンプトを再利用または改善します。</p>
      </div>

      {history.length === 0 ? (
        <div className="text-center bg-dark-surface p-8 rounded-lg">
          <p className="text-gray-400">まだ履歴がありません。</p>
          <p className="text-gray-500 mt-2">ワークスペースで新しいプロンプトを作成すると、ここに自動的に保存されます。</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {history.map(item => (
            <div key={item.id} className="bg-dark-card p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex-1 overflow-hidden">
                <p className="text-white font-semibold truncate" title={item.idea}>アイデア: {item.idea || '無題'}</p>
                <p className="text-gray-400 text-sm truncate" title={formatPreview(item.prompt)}>{formatPreview(item.prompt)}</p>
                 <p className="text-xs text-gray-500 mt-1">{formatDate(item.createdAt)}</p>
              </div>
              <Button onClick={() => navigateTo(View.Workspace, item)} variant="secondary" className="flex-shrink-0">
                編集
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
