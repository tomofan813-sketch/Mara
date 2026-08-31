import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Volume2,
  VolumeX,
  Heart,
  Bookmark,
  Share2,
  MessageSquare,
  Sparkles,
  Zap,
  HelpCircle,
  UserPlus,
  Gauge,
  Flag,
  ChevronDown,
  ChevronUp,
  Check,
  Wrench
} from 'lucide-react';
import { SkillVideo } from '../types';
import { sound } from '../utils/audio';

interface VideoItemProps {
  skill: SkillVideo;
  isActive: boolean;
  onOpenSteps: () => void;
  onOpenQuiz: () => void;
  onOpenAiTutor: () => void;
  onOpenSandbox: () => void;
  onOpenResources: () => void;
  onOpenComments: () => void;
  onOpenProfile?: (creator: any) => void;
  onReportVideo?: (skill: SkillVideo) => void;
  onToggleLike: (skillId: string) => void;
  onToggleSave: (skillId: string) => void;
  onToggleFollow?: (creatorUid: string) => void;
  isFollowed?: boolean;
  onShare: (skill: SkillVideo) => void;
  onNextVideo?: () => void;
  onPrevVideo?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export const VideoItem: React.FC<VideoItemProps> = ({
  skill,
  isActive,
  onOpenSteps,
  onOpenQuiz,
  onOpenAiTutor,
  onOpenSandbox,
  onOpenResources,
  onOpenComments,
  onOpenProfile,
  onReportVideo,
  onToggleLike,
  onToggleSave,
  onToggleFollow,
  isFollowed = false,
  onShare,
  onNextVideo,
  onPrevVideo,
  hasNext,
  hasPrev,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(skill.durationSeconds || 45);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [activeCaption, setActiveCaption] = useState<string>('');

  // Handle active video playback
  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
        });
    } else if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlayPause = () => {
    sound.playPop();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playPop();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSpeedChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playPop();
    const rates = [1, 1.25, 1.5, 2, 0.75];
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    const newRate = rates[nextIndex];
    setPlaybackRate(newRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = newRate;
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    // Check captions
    if (skill.captionHighlights && skill.captionHighlights.length > 0) {
      const match = [...skill.captionHighlights].reverse().find(c => curr >= c.time);
      if (match) {
        setActiveCaption(match.text);
      }
    }
  };

  const handleDoubleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!skill.isLiked) {
      onToggleLike(skill.id);
    }
    setShowHeartAnimation(true);
    sound.playPop();
    setTimeout(() => setShowHeartAnimation(false), 900);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="relative w-full h-full max-w-md mx-auto bg-black rounded-none sm:rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center select-none border-0 sm:border border-neutral-800"
      onDoubleClick={handleDoubleTap}
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={skill.videoUrl}
        poster={skill.posterUrl}
        loop
        playsInline
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) setDuration(videoRef.current.duration || skill.durationSeconds);
        }}
        onClick={togglePlayPause}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Subtle overlay gradients for pristine contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85 pointer-events-none" />

      {/* Play/Pause Center Indicator */}
      {!isPlaying && (
        <button
          onClick={togglePlayPause}
          className="absolute inset-0 m-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10 shadow-xl"
        >
          <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-white pr-0.5" />
        </button>
      )}

      {/* Big Heart Animation on Double Click */}
      <AnimatePresence>
        {showHeartAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.3, opacity: 1 }}
            exit={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 m-auto w-20 h-20 text-rose-500 flex items-center justify-center pointer-events-none z-20"
          >
            <Heart className="w-20 h-20 fill-rose-500 drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Overlays */}
      <div className="absolute top-2.5 sm:top-3.5 left-2.5 right-2.5 sm:left-4 sm:right-4 flex items-center justify-between z-20 text-xs">
        {/* Category & Level Badge */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-white text-[11px] sm:text-xs">
          <span className="text-emerald-400 font-bold">● {skill.categoryLabel}</span>
          <span className="text-neutral-500">•</span>
          <span className="text-neutral-300">{skill.level}</span>
        </div>

        {/* Top Controls: Speed, Report & Sound */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Report Button */}
          {onReportVideo && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReportVideo(skill);
              }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/70 backdrop-blur-md hover:bg-rose-950/70 border border-white/10 text-neutral-400 hover:text-rose-400 flex items-center justify-center transition-colors"
              title="إبلاغ عن محتوى"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Speed Toggle */}
          <button
            onClick={handleSpeedChange}
            className="bg-black/70 backdrop-blur-md hover:bg-black/90 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-white/10 text-white font-mono font-bold text-[10px] sm:text-xs flex items-center gap-1 transition-colors"
            title="سرعة التشغيل"
          >
            <Gauge className="w-3 h-3 text-amber-400" />
            <span>{playbackRate}x</span>
          </button>

          {/* Mute Toggle */}
          <button
            onClick={toggleMute}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/70 backdrop-blur-md hover:bg-black/90 border border-white/10 text-white flex items-center justify-center transition-colors"
            title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Side Action Rail (Educational & Interaction Superpowers) */}
      <div className="absolute bottom-4 sm:bottom-6 left-2 sm:left-3 flex flex-col items-center gap-1.5 sm:gap-2.5 z-20">
        {/* Creator Avatar & Profile Trigger */}
        <div className="relative group cursor-pointer mb-0.5" onClick={() => onOpenProfile && onOpenProfile(skill.creator)}>
          <img
            src={skill.creator.avatar}
            alt={skill.creator.name}
            className="w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full object-cover border-2 border-emerald-400 shadow-lg bg-neutral-800"
          />
          {onToggleFollow && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFollow(skill.creator.handle);
              }}
              className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full flex items-center justify-center hover:scale-110 transition-transform ${
                isFollowed ? 'bg-neutral-800 text-emerald-400 border border-emerald-400' : 'bg-emerald-500 text-black'
              }`}
              title={isFollowed ? 'تتابعه بالفعل' : 'متابعة المدرب'}
            >
              {isFollowed ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <UserPlus className="w-2.5 h-2.5 stroke-[3]" />}
            </button>
          )}
        </div>

        {/* 1. LIKE BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            sound.playPop();
            onToggleLike(skill.id);
          }}
          className="flex flex-col items-center gap-0.5 group"
        >
          <div className={`w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-center transition-transform group-hover:scale-110 shadow-md ${
            skill.isLiked ? 'text-rose-500 border-rose-500/40' : 'text-white'
          }`}>
            <Heart className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${skill.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-white shadow-black drop-shadow">
            {(skill.stats.likes + (skill.isLiked ? 1 : 0)).toLocaleString()}
          </span>
        </button>

        {/* 2. ACTION BLUEPRINT (خطوات التنفيذ) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            sound.playPop();
            onOpenSteps();
          }}
          className="flex flex-col items-center gap-0.5 group relative"
        >
          <div className="w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full bg-amber-500 text-black font-extrabold flex items-center justify-center shadow-lg shadow-amber-950/80 transition-transform group-hover:scale-110">
            <Zap className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-black" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-amber-300 drop-shadow">
            الخطوات
          </span>
        </button>

        {/* 3. INSTANT QUIZ (اختبار سريع + XP) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            sound.playPop();
            onOpenQuiz();
          }}
          className="flex flex-col items-center gap-0.5 group relative"
        >
          <div className="w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-950 transition-transform group-hover:scale-110">
            <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-300" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-purple-300 drop-shadow">
            اختبار
          </span>
        </button>

        {/* 4. AI TUTOR (المعلم الذكي) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            sound.playPop();
            onOpenAiTutor();
          }}
          className="flex flex-col items-center gap-0.5 group"
        >
          <div className="w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-950 transition-transform group-hover:scale-110">
            <HelpCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-indigo-300 drop-shadow">
            الـ AI
          </span>
        </button>

        {/* 5. INTERACTIVE SANDBOX (تطبيق عملي) if available */}
        {skill.sandboxType && skill.sandboxType !== 'none' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              sound.playPop();
              onOpenSandbox();
            }}
            className="flex flex-col items-center gap-0.5 group"
          >
            <div className="w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-950 transition-transform group-hover:scale-110">
              <span className="text-xs font-bold">🧪</span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-300 drop-shadow">
              تطبيق
            </span>
          </button>
        )}

        {/* 6. TOOLBOX / RESOURCES */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            sound.playPop();
            onOpenResources();
          }}
          className="flex flex-col items-center gap-0.5 group"
        >
          <div className="w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-cyan-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-neutral-300 drop-shadow">
            المصادر
          </span>
        </button>

        {/* 7. COMMENTS */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            sound.playPop();
            onOpenComments();
          }}
          className="flex flex-col items-center gap-0.5 group"
        >
          <div className="w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white flex items-center justify-center transition-transform group-hover:scale-110">
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-white drop-shadow">
            {skill.comments.length}
          </span>
        </button>

        {/* 8. BOOKMARK TO BAG */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            sound.playPop();
            onToggleSave(skill.id);
          }}
          className="flex flex-col items-center gap-0.5 group"
        >
          <div className={`w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-center transition-transform group-hover:scale-110 ${
            skill.isSaved ? 'text-amber-400 border-amber-400/40' : 'text-white'
          }`}>
            <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${skill.isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-neutral-300 drop-shadow">
            حفظ
          </span>
        </button>

        {/* 9. SHARE */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            sound.playPop();
            onShare(skill);
          }}
          className="flex flex-col items-center gap-0.5 group"
        >
          <div className="w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white flex items-center justify-center transition-transform group-hover:scale-110">
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-neutral-300 drop-shadow">
            مشاركة
          </span>
        </button>
      </div>

      {/* Up / Down Navigation Arrows for Desktop */}
      <div className="hidden lg:flex flex-col gap-2 absolute -left-14 top-1/2 -translate-y-1/2 z-20">
        {hasPrev && (
          <button
            onClick={onPrevVideo}
            className="w-10 h-10 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-white flex items-center justify-center transition-colors shadow-lg"
            title="المقطع السابق (سهم لأعلى)"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        )}
        {hasNext && (
          <button
            onClick={onNextVideo}
            className="w-10 h-10 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-white flex items-center justify-center transition-colors shadow-lg"
            title="المقطع التالي (سهم لأسفل)"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Bottom Information Overlay (Placed on the right side in RTL, strictly avoiding the side rail) */}
      <div className="absolute bottom-2.5 sm:bottom-4 right-2.5 left-14 sm:right-4 sm:left-18 z-10 text-white space-y-1.5 pointer-events-none pb-1">
        {/* Active Caption / Highlight Banner */}
        {activeCaption && (
          <div className="bg-black/80 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-xl text-xs font-semibold text-emerald-300 leading-snug w-fit max-w-[90%] shadow-lg pointer-events-auto">
            💬 {activeCaption}
          </div>
        )}

        {/* Creator Handle & Verified */}
        <div
          className="flex items-center gap-1.5 pointer-events-auto cursor-pointer flex-wrap"
          onClick={() => onOpenProfile && onOpenProfile(skill.creator)}
        >
          <span className="font-bold text-xs sm:text-sm text-white drop-shadow hover:underline">
            {skill.creator.name}
          </span>
          {skill.creator.isVerified && (
            <span className="bg-emerald-500 text-black text-[9px] px-1 py-0.2 rounded font-bold">
              ✓ موثق
            </span>
          )}
          <span className="text-[11px] sm:text-xs text-neutral-400 font-mono" dir="ltr">
            {skill.creator.handle}
          </span>
        </div>

        {/* Skill Title */}
        <h2 className="text-xs sm:text-sm md:text-base font-extrabold text-white leading-tight drop-shadow line-clamp-2">
          {skill.title}
        </h2>

        {/* Skill Summary */}
        <p className="text-[11px] sm:text-xs text-neutral-300 line-clamp-2 leading-tight drop-shadow">
          {skill.summary}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 pt-0.5">
          {skill.tags.map((t, idx) => (
            <span
              key={idx}
              className="text-[10px] sm:text-[11px] font-semibold text-emerald-300 bg-black/60 px-1.5 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap"
            >
              #{t}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
        <div
          className="h-full bg-emerald-400 transition-all duration-100 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
