import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, 
  ListTodo, 
  Network, 
  Plus, 
  Sparkles, 
  Hash, 
  Filter,
  RefreshCw,
  Search
} from 'lucide-react';
import { Idea, Theme, ViewTab, THEME_COLORS } from './types';
import { AddIdeaModal } from './components/AddIdeaModal';
import { IdeaCard } from './components/IdeaCard';
import { MindMap } from './components/MindMap';
import { summarizeTheme } from './services/geminiService';
import { cn } from './lib/utils';

const INITIAL_THEMES: Theme[] = [
  { id: '1', label: 'People', color: THEME_COLORS[0] },
  { id: '2', label: 'Process', color: THEME_COLORS[1] },
  { id: '3', label: 'Technology', color: THEME_COLORS[2] },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('board');
  const [ideas, setIdeas] = useState<Idea[]>(() => {
    const saved = localStorage.getItem('brainstorm_ideas');
    return saved ? JSON.parse(saved) : [];
  });
  const [themes, setThemes] = useState<Theme[]>(() => {
    const saved = localStorage.getItem('brainstorm_themes');
    return saved ? JSON.parse(saved) : INITIAL_THEMES;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterThemeId, setFilterThemeId] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Persist state
  useEffect(() => {
    localStorage.setItem('brainstorm_ideas', JSON.stringify(ideas));
    localStorage.setItem('brainstorm_themes', JSON.stringify(themes));
  }, [ideas, themes]);

  const handleAddIdea = (text: string, themeLabel: string) => {
    let theme = themes.find(t => t.label.toLowerCase() === themeLabel.toLowerCase());
    
    if (!theme) {
      theme = {
        id: crypto.randomUUID(),
        label: themeLabel,
        color: THEME_COLORS[themes.length % THEME_COLORS.length]
      };
      setThemes([...themes, theme]);
    }

    const newIdea: Idea = {
      id: crypto.randomUUID(),
      text,
      themeId: theme.id,
      timestamp: Date.now(),
    };

    setIdeas([newIdea, ...ideas]);
  };

  const filteredIdeas = useMemo(() => {
    return ideas.filter(idea => {
      const matchesTheme = !filterThemeId || idea.themeId === filterThemeId;
      const matchesSearch = idea.text.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTheme && matchesSearch;
    });
  }, [ideas, filterThemeId, searchQuery]);

  const runSummaries = async () => {
    setIsSummarizing(true);
    const newSummaries: Record<string, string> = {};
    
    for (const theme of themes) {
      const themeIdeas = ideas.filter(i => i.themeId === theme.id).map(i => i.text);
      if (themeIdeas.length > 0) {
        newSummaries[theme.id] = await summarizeTheme(theme.label, themeIdeas);
      }
    }
    
    setSummaries(newSummaries);
    setIsSummarizing(false);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-black text-white p-2 rounded-xl">
                <Sparkles size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Brainstorm</h1>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest leading-none">Collaborative Think Tank</p>
              </div>
            </div>

            <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1">
              {[
                { id: 'board', icon: LayoutGrid, label: 'Board' },
                { id: 'summary', icon: ListTodo, label: 'Summary' },
                { id: 'mindmap', icon: Network, label: 'Mind Map' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ViewTab)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                    activeTab === tab.id 
                      ? "bg-white text-black shadow-sm ring-1 ring-black/5" 
                      : "text-gray-500 hover:text-black hover:bg-white/50"
                  )}
                >
                  <tab.icon size={18} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="w-[120px] justify-end hidden sm:flex">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-black text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-all flex items-center gap-2 active:scale-95"
              >
                <Plus size={18} />
                Add Idea
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AnimatePresence mode="wait">
          {activeTab === 'board' && (
            <motion.div
              key="board"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Board Header & Filters */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">Idea Feed</h2>
                  <p className="text-gray-500 font-medium">Capture every spark of inspiration in the room.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search ideas..."
                      className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all w-full sm:w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-white border border-gray-200 p-1 rounded-xl">
                    <div className="px-2 text-gray-400"><Filter size={14} /></div>
                    <button
                      onClick={() => setFilterThemeId(null)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                        !filterThemeId ? "bg-black text-white" : "hover:bg-gray-100 text-gray-600"
                      )}
                    >
                      All
                    </button>
                    {themes.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setFilterThemeId(t.id)}
                        className={cn(
                          "px-3 py-1 rounded-lg text-xs font-semibold transition-all border",
                          filterThemeId === t.id ? t.color : "bg-transparent text-gray-600 border-transparent hover:bg-gray-100"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grid */}
              {filteredIdeas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredIdeas.map((idea) => (
                    <IdeaCard 
                      key={idea.id} 
                      idea={idea} 
                      theme={themes.find(t => t.id === idea.themeId)!} 
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                  <div className="bg-gray-50 p-6 rounded-full mb-6">
                    <Sparkles className="text-gray-300" size={48} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No ideas yet</h3>
                  <p className="text-gray-500 mb-8 max-w-sm text-center">Break the silence! Be the first to share your thoughts with the group.</p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-black text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-black/10 hover:shadow-black/20 hover:scale-105 transition-all"
                  >
                    Start the Session
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">Synthesized Results</h2>
                  <p className="text-gray-500 font-medium">AI-powered consolidation of collective feedback.</p>
                </div>
                <button
                  onClick={runSummaries}
                  disabled={isSummarizing || ideas.length === 0}
                  className="bg-black text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <RefreshCw className={cn(isSummarizing && "animate-spin")} size={18} />
                  {isSummarizing ? "Synthesizing..." : "Refresh Summary"}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {themes.filter(t => ideas.some(i => i.themeId === t.id)).map(theme => (
                  <div key={theme.id} className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-3 h-3 rounded-full", theme.color.split(' ')[0])} />
                        <h3 className="text-xl font-bold">{theme.label}</h3>
                      </div>
                      <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest">
                        {ideas.filter(i => i.themeId === theme.id).length} Ideas
                      </span>
                    </div>

                    {summaries[theme.id] && (
                      <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-6 rounded-2xl relative overflow-hidden group">
                        <Sparkles className="absolute -right-2 -top-2 text-gray-100 group-hover:text-amber-100 transition-colors" size={64} />
                        <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <Sparkles size={10} />
                          AI Synthesis
                        </h4>
                        <p className="text-gray-800 font-medium italic relative z-10 leading-relaxed">
                          "{summaries[theme.id]}"
                        </p>
                      </div>
                    )}

                    <ul className="space-y-4">
                      {ideas.filter(i => i.themeId === theme.id).map(idea => (
                        <li key={idea.id} className="flex gap-4 group">
                          <div className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-black transition-colors shrink-0" />
                          <p className="text-gray-600 group-hover:text-gray-900 transition-colors">{idea.text}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {ideas.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                  Submit ideas first to see synthesized themes.
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'mindmap' && (
            <motion.div
              key="mindmap"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">Knowledge Map</h2>
                <p className="text-gray-500 font-medium">Interactive visual landscape of all brainstormed concepts.</p>
              </div>

              <MindMap ideas={ideas} themes={themes} />
              
              <div className="flex items-center gap-6 justify-center text-xs text-gray-400 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-black"></div>
                  <span>Main Session</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <span>Themes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                  <span>Specific Ideas</span>
                </div>
                <div className="ml-4 italic">Tip: Scroll to zoom, drag to pan the map.</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-8 right-8 sm:hidden z-50">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shadow-2xl shadow-black/40 active:scale-90 transition-transform"
        >
          <Plus size={32} />
        </button>
      </div>

      <AddIdeaModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddIdea}
        existingThemes={themes}
      />
    </div>
  );
}
