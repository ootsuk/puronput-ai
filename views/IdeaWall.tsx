import React, { useState, useCallback, useRef } from 'react';
import { View, IdeaNode } from '../types';
import { generateIdeaKeywords } from '../services/geminiService';
import Button from '../components/Button';
import Loader from '../components/Loader';

// FIX: Made the 'idea' parameter in navigateTo optional to allow navigation to views without a payload.
const IdeaWall: React.FC<{ navigateTo: (view: View, idea?: string) => void; }> = ({ navigateTo }) => {
  const [centralKeyword, setCentralKeyword] = useState('');
  const [nodes, setNodes] = useState<IdeaNode[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const wallRef = useRef<HTMLDivElement>(null);

  const handleGenerateKeywords = useCallback(async () => {
    if (!centralKeyword) {
      setError('中央のキーワードを入力してください。');
      return;
    }
    setError('');
    setIsLoading(true);
    setNodes([]);
    setSelectedNodeIds(new Set());
    
    const wallWidth = wallRef.current?.offsetWidth || 800;
    const wallHeight = wallRef.current?.offsetHeight || 600;

    const centralNode: IdeaNode = {
      id: 0,
      text: centralKeyword,
      x: wallWidth / 2,
      y: wallHeight / 2,
      parentId: null,
    };
    
    try {
      const keywords = await generateIdeaKeywords(centralKeyword);
      const newNodes: IdeaNode[] = [centralNode];
      const radius = Math.min(wallWidth, wallHeight) / 3;
      keywords.forEach((keyword, index) => {
        const angle = (index / keywords.length) * 2 * Math.PI;
        newNodes.push({
          id: index + 1,
          text: keyword,
          x: centralNode.x + radius * Math.cos(angle),
          y: centralNode.y + radius * Math.sin(angle),
          parentId: 0,
        });
      });
      setNodes(newNodes);
      setSelectedNodeIds(new Set([0]));
    } catch (e) {
      setError('キーワードの生成に失敗しました。');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [centralKeyword]);

  const toggleNodeSelection = (nodeId: number) => {
    setSelectedNodeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const createPromptFromSelection = () => {
    const selectedNodes = nodes.filter(node => selectedNodeIds.has(node.id));
    const ideaText = selectedNodes.map(node => node.text).join('、');
    if (ideaText) {
      navigateTo(View.Workspace, ideaText);
    } else {
      alert('プロンプトを作成するには、少なくとも1つのノードを選択してください。');
    }
  };

  const getParentNode = (node: IdeaNode): IdeaNode | undefined => {
      if (node.parentId === null) return undefined;
      return nodes.find(n => n.id === node.parentId);
  }

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
        <h2 className="text-4xl font-extrabold text-white mb-2">アイデア発想ウォール</h2>
        <p className="text-lg text-gray-400">漠然としたテーマから、プロンプトの種を見つけましょう。</p>
      </div>
      <div className="flex justify-center items-center gap-4 mb-8">
        <input
          type="text"
          value={centralKeyword}
          onChange={(e) => setCentralKeyword(e.target.value)}
          placeholder="中央のキーワードを入力 (例: サイバーパンク)"
          className="w-full max-w-md p-3 bg-dark-card border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-purple focus:outline-none"
        />
        <Button onClick={handleGenerateKeywords} isLoading={isLoading}>キーワードを展開</Button>
      </div>
       {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div ref={wallRef} className="relative w-full h-[600px] bg-dark-surface rounded-lg shadow-inner overflow-hidden border border-gray-700">
        {isLoading ? <div className="absolute inset-0 flex items-center justify-center"><Loader /></div> :
        <>
        {nodes.map(node => {
             const parent = getParentNode(node);
             return parent && (
                 <svg key={`line-${node.id}`} className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                     <line x1={parent.x} y1={parent.y} x2={node.x} y2={node.y} stroke="#4a4a6a" strokeWidth="1" />
                 </svg>
             )
        })}
        {nodes.map(node => (
          <div
            key={node.id}
            onClick={() => toggleNodeSelection(node.id)}
            className={`absolute px-4 py-2 rounded-full cursor-pointer transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 select-none ${node.parentId === null ? 'bg-brand-purple text-white font-bold text-lg' : 'bg-dark-card text-dark-text'} ${selectedNodeIds.has(node.id) ? 'ring-2 ring-offset-2 ring-offset-dark-surface ring-dark-accent shadow-lg' : 'ring-0'}`}
            style={{ left: `${node.x}px`, top: `${node.y}px` }}
          >
            {node.text}
          </div>
        ))}
        </>
        }
      </div>

      <div className="mt-8 text-center">
        <Button onClick={createPromptFromSelection} disabled={selectedNodeIds.size === 0}>
          選択したキーワードでプロンプトを作成 ({selectedNodeIds.size})
        </Button>
      </div>
    </div>
  );
};

export default IdeaWall;