export enum View {
  Dashboard = 'DASHBOARD',
  Workspace = 'WORKSPACE',
  IdeaWall = 'IDEAWALL',
  TemplateLibrary = 'TEMPLATE_LIBRARY',
  History = 'HISTORY',
}

export enum TemplateCategory {
  Business = 'ビジネス',
  Creative = 'クリエイティブ',
  Learning = '学習',
}

export interface PromptElements {
  role: string;
  purpose: string;
  constraints: string;
  details: string;
}

export interface PromptTemplate {
  id: number;
  title: string;
  description: string;
  category: TemplateCategory;
  prompt: PromptElements;
}

export interface HistoryItem {
  id: string;
  createdAt: string;
  idea: string;
  prompt: PromptElements;
}

export interface AppState {
  currentView: View;
  payload?: string | PromptTemplate | HistoryItem;
}

export interface PromptSuggestions {
  roles: string[];
  purposes: string[];
  constraints: string[];
}

export interface IdeaNode {
    id: number;
    text: string;
    x: number;
    y: number;
    parentId: number | null;
}