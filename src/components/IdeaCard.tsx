import { motion } from 'motion/react';
import { Idea, Theme } from '../types';
import { cn } from '../lib/utils';

interface IdeaCardProps {
  idea: Idea;
  theme: Theme;
}

export function IdeaCard({ idea, theme }: IdeaCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group"
    >
      <div className={cn(
        "inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border mb-4 transition-colors",
        theme.color
      )}>
        {theme.label}
      </div>
      <p className="text-gray-800 leading-relaxed text-lg font-medium">
        {idea.text}
      </p>
      <div className="mt-4 flex items-center justify-between text-[10px] text-gray-400 font-medium tracking-wider uppercase">
        <span>Anonymous</span>
        <span>{new Date(idea.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </motion.div>
  );
}
