export interface Idea {
  id: string;
  text: string;
  themeId: string;
  timestamp: number;
}

export interface Theme {
  id: string;
  label: string;
  color: string;
}

export type ViewTab = 'board' | 'summary' | 'mindmap';

export const THEME_COLORS = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-emerald-100 text-emerald-800 border-emerald-200',
  'bg-orange-100 text-orange-800 border-orange-200',
  'bg-pink-100 text-pink-800 border-pink-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200',
  'bg-rose-100 text-rose-800 border-rose-200',
  'bg-amber-100 text-amber-800 border-amber-200',
];

export const THEME_HEX_COLORS = [
  '#3b82f6', // blue-500
  '#a855f7', // purple-500
  '#10b981', // emerald-500
  '#f97316', // orange-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
  '#f43f5e', // rose-500
  '#f59e0b', // amber-500
];
