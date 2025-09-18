import React, { useState, useMemo } from 'react';
import { View, PromptTemplate, TemplateCategory } from '../types';
import { templates } from '../data/templates';
import Button from '../components/Button';

interface TemplateLibraryProps {
  // FIX: Made the 'payload' parameter optional to allow navigation to views without a payload.
  navigateTo: (view: View, payload?: PromptTemplate) => void;
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ navigateTo }) => {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all');

  const categories = useMemo(() => ['all', ...Object.values(TemplateCategory)], []);
  
  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'all') {
      return templates;
    }
    return templates.filter(t => t.category === activeCategory);
  }, [activeCategory]);

  const handleSelectTemplate = (template: PromptTemplate) => {
    navigateTo(View.Workspace, template);
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
        <h2 className="text-4xl font-extrabold text-white mb-2">テンプレートライブラリ</h2>
        <p className="text-lg text-gray-400">専門家が作成したテンプレートから、目的に合ったものを選びましょう。</p>
      </div>

      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category as TemplateCategory | 'all')}
            className={`px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${
              activeCategory === category
                ? 'bg-brand-purple text-white'
                : 'bg-dark-surface text-dark-text hover:bg-dark-card'
            }`}
          >
            {category === 'all' ? 'すべて' : category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <div key={template.id} className="bg-dark-card p-6 rounded-lg shadow-lg flex flex-col justify-between border border-transparent hover:border-brand-purple/50 transition-colors">
            <div>
              <span className="text-xs font-semibold bg-dark-accent/50 text-dark-accent px-2 py-1 rounded-full">{template.category}</span>
              <h3 className="text-xl font-bold text-white mt-3 mb-2">{template.title}</h3>
              <p className="text-gray-400 text-sm mb-4 h-20">{template.description}</p>
            </div>
            <Button onClick={() => handleSelectTemplate(template)} variant="secondary">
              このテンプレートを使用
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateLibrary;