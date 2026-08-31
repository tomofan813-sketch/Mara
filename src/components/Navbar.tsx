import React from 'react';
import { 
  Bookmark, 
  Plus, 
  Search, 
  Bell, 
  Shield, 
  LogIn, 
  Compass,
  Users
} from 'lucide-react';
import { SkillCategory, UserProgress } from '../types';
import { CATEGORIES_LIST } from '../data/skillsData';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audio';

interface NavbarProps {
  selectedCategory: SkillCategory;
  onSelectCategory: (cat: SkillCategory) => void;
  feedTab: 'foryou' | 'following';
  onSelectFeedTab: (tab: 'foryou' | 'following') => void;
  userProgress: UserProgress;
  onOpenSkillBag: () => void;
  onOpenCreateModal: () => void;
  onOpenAuthModal: () => void;
  onOpenProfileModal: () => void;
  onOpenNotifications: () => void;
  onOpenAdminPanel: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedCategory,
  onSelectCategory,
  feedTab,
  onSelectFeedTab,
  userProgress: _userProgress,
  onOpenSkillBag,
  onOpenCreateModal,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenNotifications,
  onOpenAdminPanel,
  searchQuery,
  onSearchChange,
}) => {
  const { currentUser, userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin' || currentUser?.email === 'admin@mahara.app';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/80 safe-top-pad select-none">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-13 sm:h-14 flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* Right side in RTL: Brand Logo & Title */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-500 flex items-center justify-center font-black text-black text-sm sm:text-base shadow-md shadow-emerald-950 flex-shrink-0">
            م
          </div>
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-sm sm:text-base tracking-tight bg-gradient-to-r from-emerald-400 via-teal-200 to-indigo-300 bg-clip-text text-transparent whitespace-nowrap">
              مَهَارَة
            </span>
            <span className="hidden sm:inline-block text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.2 rounded font-bold">
              LearnTok
            </span>
          </div>
        </div>

        {/* Center: For You / Following Switcher Tabs */}
        <div className="flex items-center bg-neutral-900/90 border border-neutral-800/80 p-0.5 rounded-full text-xs font-bold flex-shrink-0">
          <button
            onClick={() => {
              sound.playPop();
              onSelectFeedTab('foryou');
            }}
            className={`px-2.5 sm:px-3.5 py-1 rounded-full transition-all flex items-center gap-1 text-[11px] sm:text-xs ${
              feedTab === 'foryou'
                ? 'bg-emerald-500 text-black shadow-sm font-black'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>لك</span>
            <span className="hidden md:inline text-[10px] opacity-80">(For You)</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              onSelectFeedTab('following');
            }}
            className={`px-2.5 sm:px-3.5 py-1 rounded-full transition-all flex items-center gap-1 text-[11px] sm:text-xs ${
              feedTab === 'following'
                ? 'bg-emerald-500 text-black shadow-sm font-black'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>أتابعهم</span>
          </button>
        </div>

        {/* Real Live Search Bar (Desktop / Tablet) */}
        <div className="flex-1 max-w-xs relative hidden lg:block mx-2">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث عن مهارات أو مدربين..."
            className="w-full bg-neutral-900/80 border border-neutral-800 focus:border-emerald-500 focus:outline-none rounded-full pr-8 pl-3 py-1 text-xs text-neutral-200 placeholder-neutral-500"
          />
        </div>

        {/* Left side in RTL: User Actions, Notifications & Profile */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Admin Panel button if user has role */}
          {isAdmin && (
            <button
              onClick={() => {
                sound.playPop();
                onOpenAdminPanel();
              }}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1 transition-colors"
              title="لوحة الإدارة"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">الإدارة</span>
            </button>
          )}

          {/* Notifications Trigger */}
          <button
            onClick={() => {
              sound.playPop();
              onOpenNotifications();
            }}
            className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors flex items-center justify-center relative"
            title="الإشعارات"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-neutral-950" />
          </button>

          {/* Skill Bag Button */}
          <button
            onClick={() => {
              sound.playPop();
              onOpenSkillBag();
            }}
            className="w-8 h-8 sm:w-auto sm:px-2.5 sm:py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
            title="حقيبة مهاراتي"
          >
            <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xl:inline">حقيبتي</span>
          </button>

          {/* Add Skill Button */}
          <button
            onClick={() => {
              sound.playPop();
              onOpenCreateModal();
            }}
            className="w-8 h-8 sm:w-auto sm:px-3 sm:py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950 transition-all flex items-center justify-center gap-1"
            title="نشر مهارة"
          >
            <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">نشر مهارة</span>
          </button>

          {/* User Profile Avatar / Sign In */}
          {currentUser ? (
            <button
              onClick={() => {
                sound.playPop();
                onOpenProfileModal();
              }}
              className="flex items-center gap-1 p-0.5 sm:px-2 sm:py-1 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors"
              title="الملف الشخصي"
            >
              <img
                src={userProfile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                alt=""
                className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full object-cover bg-neutral-800 border border-emerald-400/40"
              />
              <span className="text-xs font-bold text-neutral-200 hidden xl:inline max-w-[70px] truncate">
                {userProfile?.name?.split(' ')[0] || 'حسابي'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playPop();
                onOpenAuthModal();
              }}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>دخول</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="w-full border-t border-neutral-900/90 bg-neutral-950/70">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-scroll text-xs font-semibold">
          {CATEGORIES_LIST.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  sound.playPop();
                  onSelectCategory(cat.id);
                }}
                className={`whitespace-nowrap flex-shrink-0 px-3 py-1 rounded-full transition-all flex items-center gap-1 text-[11px] sm:text-xs ${
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
      </div>
    </header>
  );
};
