import React from 'react';
import { Flame, Sparkles, Bookmark, Plus, Search, BookOpen, Layers, Award } from 'lucide-react';
import { SkillCategory, UserProgress } from '../types';
import { CATEGORIES_LIST } from '../data/skillsData';
import { sound } from '../utils/audio';

interface NavbarProps {
  selectedCategory: SkillCategory;
  onSelectCategory: (cat: SkillCategory) => void;
  userProgress: UserProgress;
  onOpenSkillBag: () => void;
  onOpenCreateModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedCategory,
  onSelectCategory,
  userProgress,
  onOpenSkillBag,
  onOpenCreateModal,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-500 flex items-center justify-center font-black text-black text-lg shadow-lg shadow-emerald-950">
            م
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-200 to-indigo-300 bg-clip-text text-transparent">
                مَهَارَة
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                LearnTok
              </span>
            </div>
            <p className="text-[9px] text-neutral-400 hidden sm:block">
              تيك توك المهارات العملية والمحتوى التعليمي
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xs sm:max-w-sm relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث عن مهارة (برمجة، صيانة، لغات، أعمال)..."
            className="w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500 focus:outline-none rounded-full pr-8 pl-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500"
          />
        </div>

        {/* User Stats & Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Daily Streak */}
          <div
            onClick={() => {
              sound.playPop();
              onOpenSkillBag();
            }}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-amber-500/10 border border-amber-500/25 rounded-full text-amber-300 text-xs font-bold cursor-pointer hover:bg-amber-500/20 transition-colors"
            title="سلسلة أيام التعلم المستمر"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-bounce" />
            <span className="font-mono">{userProgress.streakDays}</span>
            <span className="hidden sm:inline text-[11px] font-medium">أيام</span>
          </div>

          {/* XP Counter */}
          <div
            onClick={() => {
              sound.playPop();
              onOpenSkillBag();
            }}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-purple-500/10 border border-purple-500/25 rounded-full text-purple-300 text-xs font-bold cursor-pointer hover:bg-purple-500/20 transition-colors"
            title="نقاط الخبرة XP"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-mono">{userProgress.xp}</span>
            <span className="text-[10px] text-purple-400">XP</span>
          </div>

          {/* Skill Bag Button */}
          <button
            onClick={() => {
              sound.playPop();
              onOpenSkillBag();
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-200 text-xs font-semibold transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">حقيبة مهاراتي</span>
          </button>

          {/* Add Skill Button */}
          <button
            onClick={() => {
              sound.playPop();
              onOpenCreateModal();
            }}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">إضافة مهارة</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-neutral-900 text-xs font-semibold">
        {CATEGORIES_LIST.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => {
                sound.playPop();
                onSelectCategory(cat.id);
              }}
              className={`whitespace-nowrap flex-shrink-0 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-500 text-black font-bold shadow-sm'
                  : 'bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 border border-neutral-800/80 hover:border-neutral-700'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
