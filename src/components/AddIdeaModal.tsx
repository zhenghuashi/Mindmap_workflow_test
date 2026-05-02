import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Theme } from '../types';
import { cn } from '../lib/utils';

interface AddIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, themeLabel: string) => void;
  existingThemes: Theme[];
}

export function AddIdeaModal({ isOpen, onClose, onSubmit, existingThemes }: AddIdeaModalProps) {
  const [text, setText] = useState('');
  const [themeLabel, setThemeLabel] = useState('');
  const [isNewTheme, setIsNewTheme] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && themeLabel.trim()) {
      onSubmit(text.trim(), themeLabel.trim());
      setText('');
      setThemeLabel('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-semibold text-gray-900">Add New Idea</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">The Idea</label>
            <textarea
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none resize-none min-h-[120px]"
              placeholder="What's your brilliant thought?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={280}
              required
            />
            <div className="mt-1 text-right text-xs text-gray-400">
              {text.length}/280
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Theme / Category</label>
              <button
                type="button"
                onClick={() => setIsNewTheme(!isNewTheme)}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                {isNewTheme ? 'Select existing' : 'Create new theme'}
              </button>
            </div>
            
            {isNewTheme ? (
              <input
                type="text"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                placeholder="New theme name..."
                value={themeLabel}
                onChange={(e) => setThemeLabel(e.target.value)}
                required
              />
            ) : (
              <select
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                value={themeLabel}
                onChange={(e) => setThemeLabel(e.target.value)}
                required
              >
                <option value="">Choose a theme...</option>
                {existingThemes.map((t) => (
                  <option key={t.id} value={t.label}>{t.label}</option>
                ))}
              </select>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Plus size={20} />
            Add to Board
          </button>
        </form>
      </div>
    </div>
  );
}
