import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { VideoItem } from './components/VideoItem';
import { ActionStepsDrawer } from './components/ActionStepsDrawer';
import { QuizDrawer } from './components/QuizDrawer';
import { AiTutorDrawer } from './components/AiTutorDrawer';
import { SandboxDrawer } from './components/SandboxDrawer';
import { ResourcesDrawer } from './components/ResourcesDrawer';
import { CommentsDrawer } from './components/CommentsDrawer';
import { SkillBagModal } from './components/SkillBagModal';
import { CreateSkillModal } from './components/CreateSkillModal';
import { INITIAL_SKILLS } from './data/skillsData';
import { SkillVideo, SkillCategory, UserProgress, ActionStep } from './types';
import { sound } from './utils/audio';
import { Check, Share2, Sparkles, Flame } from 'lucide-react';

const INITIAL_PROGRESS: UserProgress = {
  xp: 140,
  level: 2,
  levelTitle: 'مستكشف مهارات نشط',
  streakDays: 4,
  completedSkillIds: ['skill-1'],
  savedSkillIds: ['skill-1', 'skill-2'],
  likedSkillIds: ['skill-2'],
  badges: [
    {
      id: 'b1',
      title: 'وسام الشغف الأول',
      icon: '🚀',
      description: 'أتممت أول مهارة تطبيقية بنجاح واجتزت الاختبار.',
      earnedAt: 'أمس',
    },
    {
      id: 'b2',
      title: 'شعلة الاستمرار (4 أيام)',
      icon: '🔥',
      description: 'حافظت على سلسلة تعلّم المهارات اليومية 4 أيام متتالية.',
      earnedAt: 'اليوم',
    },
  ],
  quizStats: {
    totalAttempted: 3,
    totalCorrect: 3,
  },
};

export default function App() {
  const [skills, setSkills] = useState<SkillVideo[]>(() => {
    const saved = localStorage.getItem('mahara_skills');
    return saved ? JSON.parse(saved) : INITIAL_SKILLS;
  });

  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('mahara_progress');
    return saved ? JSON.parse(saved) : INITIAL_PROGRESS;
  });

  const [selectedCategory, setSelectedCategory] = useState<SkillCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Modals & Drawers State
  const [isStepsOpen, setIsStepsOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isAiTutorOpen, setIsAiTutorOpen] = useState(false);
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isSkillBagOpen, setIsSkillBagOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStepForAi, setSelectedStepForAi] = useState<ActionStep | null>(null);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const lastScrollTime = useRef<number>(0);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('mahara_skills', JSON.stringify(skills));
  }, [skills]);

  useEffect(() => {
    localStorage.setItem('mahara_progress', JSON.stringify(userProgress));
  }, [userProgress]);

  // Filter skills
  const filteredSkills = skills.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.creator.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Ensure current index is valid
  const safeIndex = Math.min(Math.max(0, currentIndex), Math.max(0, filteredSkills.length - 1));
  const activeSkill = filteredSkills[safeIndex] || skills[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleNextVideo = useCallback(() => {
    if (currentIndex < filteredSkills.length - 1) {
      sound.playPop();
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, filteredSkills.length]);

  const handlePrevVideo = useCallback(() => {
    if (currentIndex > 0) {
      sound.playPop();
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if an input is focused or modal open
      if (
        isStepsOpen ||
        isQuizOpen ||
        isAiTutorOpen ||
        isSandboxOpen ||
        isResourcesOpen ||
        isCommentsOpen ||
        isSkillBagOpen ||
        isCreateModalOpen
      ) {
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        handleNextVideo();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        handlePrevVideo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleNextVideo,
    handlePrevVideo,
    isStepsOpen,
    isQuizOpen,
    isAiTutorOpen,
    isSandboxOpen,
    isResourcesOpen,
    isCommentsOpen,
    isSkillBagOpen,
    isCreateModalOpen,
  ]);

  // Wheel listener with debounce
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastScrollTime.current < 450) return;

    if (e.deltaY > 30) {
      lastScrollTime.current = now;
      handleNextVideo();
    } else if (e.deltaY < -30) {
      lastScrollTime.current = now;
      handlePrevVideo();
    }
  };

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNextVideo();
      } else {
        handlePrevVideo();
      }
    }
    touchStartY.current = null;
  };

  // Interactions
  const handleToggleLike = (skillId: string) => {
    setSkills(prev =>
      prev.map(s => {
        if (s.id === skillId) {
          const isLiked = !s.isLiked;
          return {
            ...s,
            isLiked,
            stats: {
              ...s.stats,
              likes: s.stats.likes + (isLiked ? 1 : -1),
            },
          };
        }
        return s;
      })
    );
  };

  const handleToggleSave = (skillId: string) => {
    const isAlreadySaved = userProgress.savedSkillIds.includes(skillId);
    setUserProgress(prev => ({
      ...prev,
      savedSkillIds: isAlreadySaved
        ? prev.savedSkillIds.filter(id => id !== skillId)
        : [...prev.savedSkillIds, skillId],
    }));

    setSkills(prev =>
      prev.map(s => {
        if (s.id === skillId) {
          return {
            ...s,
            isSaved: !isAlreadySaved,
          };
        }
        return s;
      })
    );

    showToast(isAlreadySaved ? 'تمت الإزالة من دفتر المهارات' : '🔖 تم حفظ خطوات المهارة في حقيبتك!');
  };

  const handleShare = (skill: SkillVideo) => {
    sound.playPop();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `تعلم مهارة: ${skill.title} عبر منصة مهارة التعليمية 🚀\n${window.location.href}`
      );
      showToast('تم نسخ رابط بطاقة المهارة للمشاركة!');
    }
  };

  const handleCompleteQuiz = (skillId: string, xpEarned: number) => {
    setUserProgress(prev => {
      const isAlreadyCompleted = prev.completedSkillIds.includes(skillId);
      const newXp = prev.xp + xpEarned;
      const newLevel = Math.floor(newXp / 100) + 1;
      const levelTitles = ['مبتدئ فضولي', 'مستكشف مهارات نشط', 'ممارس تقني متمرس', 'خبير مهارات محترف', 'أستاذ مهارات معتمد'];
      const newLevelTitle = levelTitles[Math.min(newLevel - 1, levelTitles.length - 1)];

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        levelTitle: newLevelTitle,
        completedSkillIds: isAlreadyCompleted ? prev.completedSkillIds : [...prev.completedSkillIds, skillId],
        quizStats: {
          totalAttempted: prev.quizStats.totalAttempted + 1,
          totalCorrect: prev.quizStats.totalCorrect + 1,
        },
      };
    });

    setSkills(prev =>
      prev.map(s => (s.id === skillId ? { ...s, isCompleted: true } : s))
    );

    showToast(`🎉 أحسنت! ربحت +${xpEarned} XP ونقاط إتقان جديدة!`);
  };

  const handleAddComment = (skillId: string, text: string) => {
    const newComment = {
      id: `c-${Date.now()}`,
      userName: 'أنت (متعلم مهارات)',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      badge: 'متعلم نشط',
      text,
      likes: 0,
      timestamp: 'الآن',
    };

    setSkills(prev =>
      prev.map(s => (s.id === skillId ? { ...s, comments: [newComment, ...s.comments] } : s))
    );

    showToast('تمت إضافة تعليقك إلى مجتمع المهارة!');
  };

  const handleAddSkill = (newSkill: SkillVideo) => {
    setSkills(prev => [newSkill, ...prev]);
    setSelectedCategory('all');
    setCurrentIndex(0);
    showToast('✨ تم نشر المهارة الجديدة بنجاح في الخلاصة!');
  };

  const handleAskAiAboutStep = (step: ActionStep) => {
    setSelectedStepForAi(step);
    setIsStepsOpen(false);
    setIsAiTutorOpen(true);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-neutral-950 text-neutral-100 overflow-hidden select-none font-['Cairo',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setCurrentIndex(0);
        }}
        userProgress={userProgress}
        onOpenSkillBag={() => setIsSkillBagOpen(true)}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentIndex(0);
        }}
      />

      {/* Main Vertical Feed Area */}
      <main
        ref={containerRef}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex-1 w-full pt-[96px] pb-3 px-2 sm:px-4 flex items-center justify-center relative overflow-hidden"
      >
        {filteredSkills.length === 0 ? (
          <div className="text-center p-8 bg-neutral-900 border border-neutral-800 rounded-2xl max-w-sm">
            <Sparkles className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-neutral-100 mb-1">لا توجد مهارات في هذا التصنيف حالياً</h3>
            <p className="text-xs text-neutral-400 mb-4">
              يمكنك توليد مهارة جديدة فوراً باستخدام الذكاء الاصطناعي!
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              + توليد مهارة ذكية
            </button>
          </div>
        ) : (
          <div className="w-full h-full max-w-md flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSkill.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="w-full h-full"
              >
                <VideoItem
                  skill={activeSkill}
                  isActive={true}
                  onOpenSteps={() => setIsStepsOpen(true)}
                  onOpenQuiz={() => setIsQuizOpen(true)}
                  onOpenAiTutor={() => {
                    setSelectedStepForAi(null);
                    setIsAiTutorOpen(true);
                  }}
                  onOpenSandbox={() => setIsSandboxOpen(true)}
                  onOpenResources={() => setIsResourcesOpen(true)}
                  onOpenComments={() => setIsCommentsOpen(true)}
                  onToggleLike={handleToggleLike}
                  onToggleSave={handleToggleSave}
                  onShare={handleShare}
                  onNextVideo={handleNextVideo}
                  onPrevVideo={handlePrevVideo}
                  hasNext={safeIndex < filteredSkills.length - 1}
                  hasPrev={safeIndex > 0}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Global Toast Message */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/95 border border-emerald-500/40 text-emerald-300 text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* DRAWERS & MODALS */}
      {activeSkill && (
        <>
          <ActionStepsDrawer
            isOpen={isStepsOpen}
            onClose={() => setIsStepsOpen(false)}
            skill={activeSkill}
            onAskAiAboutStep={handleAskAiAboutStep}
            onOpenSandbox={() => {
              setIsStepsOpen(false);
              setIsSandboxOpen(true);
            }}
          />

          <QuizDrawer
            isOpen={isQuizOpen}
            onClose={() => setIsQuizOpen(false)}
            skill={activeSkill}
            onCompleteQuiz={handleCompleteQuiz}
          />

          <AiTutorDrawer
            isOpen={isAiTutorOpen}
            onClose={() => {
              setIsAiTutorOpen(false);
              setSelectedStepForAi(null);
            }}
            skill={activeSkill}
            initialStepPrompt={selectedStepForAi}
          />

          <SandboxDrawer
            isOpen={isSandboxOpen}
            onClose={() => setIsSandboxOpen(false)}
            skill={activeSkill}
          />

          <ResourcesDrawer
            isOpen={isResourcesOpen}
            onClose={() => setIsResourcesOpen(false)}
            skill={activeSkill}
          />

          <CommentsDrawer
            isOpen={isCommentsOpen}
            onClose={() => setIsCommentsOpen(false)}
            skill={activeSkill}
            onAddComment={handleAddComment}
          />
        </>
      )}

      {/* Skill Bag / Notebook Modal */}
      <SkillBagModal
        isOpen={isSkillBagOpen}
        onClose={() => setIsSkillBagOpen(false)}
        allSkills={skills}
        userProgress={userProgress}
        onSelectSkill={(skill) => {
          const targetIndex = filteredSkills.findIndex(s => s.id === skill.id);
          if (targetIndex !== -1) {
            setCurrentIndex(targetIndex);
          } else {
            setSelectedCategory('all');
            const allIdx = skills.findIndex(s => s.id === skill.id);
            setCurrentIndex(Math.max(0, allIdx));
          }
        }}
      />

      {/* Create / Generate Skill Modal */}
      <CreateSkillModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAddSkill={handleAddSkill}
      />
    </div>
  );
}
