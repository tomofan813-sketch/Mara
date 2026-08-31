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
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { ReportModal } from './components/ReportModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  getLiveVideos, 
  toggleVideoLike, 
  toggleSaveVideo, 
  toggleFollowUser 
} from './services/dbOperations';
import { INITIAL_SKILLS } from './data/skillsData';
import { SkillVideo, SkillCategory, UserProgress, ActionStep } from './types';
import { sound } from './utils/audio';
import { Check, Share2, Sparkles, Flame, RefreshCw } from 'lucide-react';

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

function MainAppContent() {
  const { currentUser, userProfile, addXp } = useAuth();

  // Primary Skills state from Firebase Firestore
  const [skills, setSkills] = useState<SkillVideo[]>(INITIAL_SKILLS);
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('mahara_progress');
    return saved ? JSON.parse(saved) : INITIAL_PROGRESS;
  });

  const [selectedCategory, setSelectedCategory] = useState<SkillCategory>('all');
  const [feedTab, setFeedTab] = useState<'foryou' | 'following'>('foryou');
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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [reportingVideo, setReportingVideo] = useState<SkillVideo | null>(null);

  const [selectedStepForAi, setSelectedStepForAi] = useState<ActionStep | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const touchStartY = useRef<number | null>(null);
  const lastScrollTime = useRef<number>(0);

  // Subscribe to live Firestore videos
  useEffect(() => {
    const unsub = getLiveVideos((fireVideos) => {
      if (fireVideos && fireVideos.length > 0) {
        // Map Firestore doc to frontend SkillVideo interface
        const mapped: SkillVideo[] = fireVideos.map((v) => ({
          id: v.id,
          title: v.title,
          creator: {
            name: v.creatorName,
            handle: v.creatorHandle || `@${v.creatorName.replace(/\s+/g, '_')}`,
            avatar: v.creatorAvatar,
            title: v.creatorTitle || 'صانع مهارات',
            isVerified: v.isVerified || false,
            followersCount: '1.2K',
          },
          videoUrl: v.videoUrl,
          posterUrl: v.posterUrl,
          category: v.category as SkillCategory,
          categoryLabel: v.categoryLabel || 'مهارة عامة',
          level: v.level as any,
          durationSeconds: v.durationSeconds || 45,
          xpReward: v.xpReward || 50,
          tags: v.tags || ['مهارة'],
          summary: v.summary || '',
          captionHighlights: v.captionHighlights || [],
          steps: (v.steps || []) as any,
          quiz: (v.quiz || []) as any,
          resources: (v.resources || []) as any,
          sandboxType: (v.sandboxType as any) || 'none',
          stats: {
            likes: v.likesCount || 0,
            views: v.viewsCount || 100,
            shares: v.sharesCount || 0,
            saves: v.savesCount || 0,
            completions: 35,
          },
          comments: [],
          isLiked: currentUser ? v.likedBy?.includes(currentUser.uid) : false,
          isSaved: currentUser ? v.savedBy?.includes(currentUser.uid) : false,
        }));
        setSkills(mapped);
      }
    });

    return () => unsub();
  }, [currentUser]);

  // Sync userProgress with localStorage
  useEffect(() => {
    localStorage.setItem('mahara_progress', JSON.stringify(userProgress));
  }, [userProgress]);

  // Filter skills by category, following feed, and search term
  const filteredSkills = skills.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    
    // Following filter
    let matchesFollowing = true;
    if (feedTab === 'following') {
      const followingList = userProfile?.following || [];
      matchesFollowing = followingList.includes(s.creator.handle);
    }

    const matchesSearch =
      !searchQuery.trim() ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.creator.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesFollowing && matchesSearch;
  });

  const safeIndex = Math.min(Math.max(0, currentIndex), Math.max(0, filteredSkills.length - 1));
  const activeSkill = filteredSkills[safeIndex] || skills[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        isStepsOpen ||
        isQuizOpen ||
        isAiTutorOpen ||
        isSandboxOpen ||
        isResourcesOpen ||
        isCommentsOpen ||
        isSkillBagOpen ||
        isCreateModalOpen ||
        isAuthModalOpen ||
        isProfileModalOpen ||
        isAdminPanelOpen ||
        isNotificationsOpen ||
        reportingVideo
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
    isAuthModalOpen,
    isProfileModalOpen,
    isAdminPanelOpen,
    isNotificationsOpen,
    reportingVideo,
  ]);

  // Touch Swipe for mobile vertical feed
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    const now = Date.now();

    if (Math.abs(diff) > 50 && now - lastScrollTime.current > 400) {
      lastScrollTime.current = now;
      if (diff > 0) {
        handleNextVideo();
      } else {
        handlePrevVideo();
      }
    }
    touchStartY.current = null;
  };

  // Wheel scroll with throttle
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastScrollTime.current > 600) {
      lastScrollTime.current = now;
      if (e.deltaY > 30) {
        handleNextVideo();
      } else if (e.deltaY < -30) {
        handlePrevVideo();
      }
    }
  };

  // Real Toggle Like with Firebase
  const handleToggleLike = async (skillId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const currentLiked = activeSkill?.isLiked || false;
    // Optimistic update
    setSkills(prev =>
      prev.map(s => (s.id === skillId ? { ...s, isLiked: !s.isLiked } : s))
    );

    try {
      await toggleVideoLike(
        skillId,
        currentUser.uid,
        userProfile?.name || 'مستخدم مهارة',
        userProfile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        activeSkill?.title || 'مهارة',
        undefined
      );
    } catch (e) {
      console.error(e);
    }
  };

  // Real Toggle Save with Firebase
  const handleToggleSave = async (skillId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const isCurrentlySaved = activeSkill?.isSaved || false;
    setSkills(prev =>
      prev.map(s => (s.id === skillId ? { ...s, isSaved: !s.isSaved } : s))
    );

    try {
      await toggleSaveVideo(skillId, currentUser.uid, isCurrentlySaved);
      showToast(isCurrentlySaved ? 'تمت إزالة المهارة من حقيبتك' : 'تم حفظ المهارة في حقيبتك بنجاح 🎒');
    } catch (e) {
      console.error(e);
    }
  };

  // Real Toggle Follow
  const handleToggleFollow = async (creatorHandle: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    sound.playSuccess();
    const isNowFollowing = await toggleFollowUser(currentUser.uid, creatorHandle);
    showToast(isNowFollowing ? `بدأت بمتابعة ${creatorHandle} ✓` : `ألغيت متابعة ${creatorHandle}`);
  };

  const handleShare = (skill: SkillVideo) => {
    sound.playPop();
    if (navigator.share) {
      navigator.share({
        title: skill.title,
        text: `تعلم "${skill.title}" على منصة مهارة (LearnTok)!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('تم نسخ رابط المهارة إلى الحافظة بنجاح 📋');
    }
  };

  const handleQuizCompleted = (earnedXp: number) => {
    addXp(earnedXp);
    setUserProgress(prev => ({
      ...prev,
      xp: prev.xp + earnedXp,
      quizStats: {
        totalAttempted: prev.quizStats.totalAttempted + 1,
        totalCorrect: prev.quizStats.totalCorrect + 1,
      },
    }));
    showToast(`رائع! حصلت على +${earnedXp} نقطة خبرة (XP) 🎉`);
  };

  return (
    <div className="h-screen h-[100dvh] w-full bg-black text-neutral-100 flex flex-col overflow-hidden font-sans select-none antialiased">
      {/* Top Fixed Header Navbar */}
      <Navbar
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setCurrentIndex(0);
        }}
        feedTab={feedTab}
        onSelectFeedTab={(tab) => {
          setFeedTab(tab);
          setCurrentIndex(0);
        }}
        userProgress={userProgress}
        onOpenSkillBag={() => setIsSkillBagOpen(true)}
        onOpenCreateModal={() => {
          if (!currentUser) {
            setIsAuthModalOpen(true);
          } else {
            setIsCreateModalOpen(true);
          }
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Feed Container (Full Screen Mobile & Sleek Centered Desktop) */}
      <main
        className="flex-1 w-full h-[calc(100dvh-82px)] sm:h-[calc(100dvh-94px)] pt-[calc(env(safe-area-inset-top,0px)+82px)] sm:pt-24 pb-[env(safe-area-inset-bottom,0px)] sm:pb-3 flex items-stretch sm:items-center justify-center relative overflow-hidden px-0 sm:px-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {filteredSkills.length === 0 ? (
          <div className="text-center p-8 bg-neutral-900/80 border border-neutral-800 rounded-3xl max-w-sm mx-auto shadow-2xl my-auto">
            <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-3 animate-pulse" />
            <h3 className="text-base font-bold text-white mb-1">لا توجد مهارات في هذا القسم حالياً</h3>
            <p className="text-xs text-neutral-400 mb-4">كن أول من ينشر مهارة أو درس فيديو في هذا التصنيف!</p>
            <button
              onClick={() => {
                if (!currentUser) setIsAuthModalOpen(true);
                else setIsCreateModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition-colors"
            >
              نشر مهارة الآن
            </button>
          </div>
        ) : (
          <div className="w-full h-full sm:max-w-md mx-auto flex items-center justify-center relative">
            {activeSkill && (
              <VideoItem
                key={activeSkill.id}
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
                onOpenProfile={() => setIsProfileModalOpen(true)}
                onReportVideo={(v) => setReportingVideo(v)}
                onToggleLike={handleToggleLike}
                onToggleSave={handleToggleSave}
                onToggleFollow={handleToggleFollow}
                isFollowed={userProfile?.following?.includes(activeSkill.creator.handle)}
                onShare={handleShare}
                onNextVideo={handleNextVideo}
                onPrevVideo={handlePrevVideo}
                hasNext={currentIndex < filteredSkills.length - 1}
                hasPrev={currentIndex > 0}
              />
            )}
          </div>
        )}
      </main>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 backdrop-blur-md"
          >
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Steps Blueprint Drawer */}
      {activeSkill && (
        <ActionStepsDrawer
          isOpen={isStepsOpen}
          onClose={() => setIsStepsOpen(false)}
          skill={activeSkill}
          onAskAiAboutStep={(step) => {
            setSelectedStepForAi(step);
            setIsStepsOpen(false);
            setIsAiTutorOpen(true);
          }}
        />
      )}

      {/* Instant Interactive Quiz Drawer */}
      {activeSkill && (
        <QuizDrawer
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          skill={activeSkill}
          onQuizComplete={handleQuizCompleted}
        />
      )}

      {/* AI Tutor Chat Drawer */}
      {activeSkill && (
        <AiTutorDrawer
          isOpen={isAiTutorOpen}
          onClose={() => {
            setIsAiTutorOpen(false);
            setSelectedStepForAi(null);
          }}
          skill={activeSkill}
          initialStepContext={selectedStepForAi}
        />
      )}

      {/* Live Code / Sandbox Drawer */}
      {activeSkill && (
        <SandboxDrawer
          isOpen={isSandboxOpen}
          onClose={() => setIsSandboxOpen(false)}
          skill={activeSkill}
        />
      )}

      {/* Resources & Cheat Sheets Drawer */}
      {activeSkill && (
        <ResourcesDrawer
          isOpen={isResourcesOpen}
          onClose={() => setIsResourcesOpen(false)}
          skill={activeSkill}
        />
      )}

      {/* Comments & Discussion Drawer */}
      {activeSkill && (
        <CommentsDrawer
          isOpen={isCommentsOpen}
          onClose={() => setIsCommentsOpen(false)}
          skill={activeSkill}
        />
      )}

      {/* Skill Bag / Saved Skills Modal */}
      <SkillBagModal
        isOpen={isSkillBagOpen}
        onClose={() => setIsSkillBagOpen(false)}
        savedSkills={skills.filter(s => s.isSaved)}
        userProgress={userProgress}
        onSelectSkill={(skillId) => {
          const targetIndex = filteredSkills.findIndex(s => s.id === skillId);
          if (targetIndex !== -1) {
            setCurrentIndex(targetIndex);
          }
          setIsSkillBagOpen(false);
        }}
      />

      {/* Create / Publish New Skill Modal */}
      <CreateSkillModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAddSkill={(newSkill) => {
          showToast('تم نشر مهارة جديدة بنجاح في مهارة! 🚀');
        }}
      />

      {/* User Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userSkills={skills.filter(s => s.creator.name === userProfile?.name || s.creator.handle === userProfile?.handle)}
      />

      {/* Admin Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
      />

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Video Reporting Modal */}
      <ReportModal
        isOpen={!!reportingVideo}
        onClose={() => setReportingVideo(null)}
        video={reportingVideo}
        onSuccess={(msg) => showToast(msg)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
