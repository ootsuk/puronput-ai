import React from 'react';
import { View } from '../types';
import Card from '../components/Card';

const NewPromptIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
);

const IdeaWallIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path><line x1="12" y1="2" x2="12" y2="3"></line></svg>
);

const TemplateIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><path d="M12 11v6"></path><path d="M9 14h6"></path></svg>
);

const HistoryIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"></path><circle cx="12" cy="12" r="10"></circle></svg>
);


interface DashboardProps {
  navigateTo: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ navigateTo }) => {
  return (
    <div className="container mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-white mb-3">インスピレーションが、形になるとき。</h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">AIとの共創で、あなたのアイデアを最高のプロンプトへ昇華させます。</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card
          title="新しいプロンプトを作成"
          description="ステップバイステップのビルダーで、ゼロから完璧なプロンプトを構築します。"
          icon={<NewPromptIcon />}
          onClick={() => navigateTo(View.Workspace)}
        />
        <Card
          title="アイデアを探す"
          description="アイデア発想ウォールで、思考を広げ、新しいコンセプトを発見します。"
          icon={<IdeaWallIcon />}
          onClick={() => navigateTo(View.IdeaWall)}
        />
        <Card
          title="テンプレートから作成"
          description="専門家が作成したテンプレートライブラリから、目的に合ったものを選びます。"
          icon={<TemplateIcon />}
          onClick={() => navigateTo(View.TemplateLibrary)}
        />
        <Card
          title="過去のプロンプト"
          description="作成したプロンプトの履歴を閲覧し、再利用または改善します。"
          icon={<HistoryIcon />}
          onClick={() => navigateTo(View.History)}
        />
      </div>
    </div>
  );
};

export default Dashboard;