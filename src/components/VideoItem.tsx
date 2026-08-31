import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  Bookmark,
  Share2,
  MessageSquare,
  Sparkles,
  Zap,
  HelpCircle,
  Wrench,
  RotateCcw,
  CheckCircle2,
  UserPlus,
  Gauge,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SkillVideo, ActionStep } from '../types';
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
  onToggleLike: (skillId: string) => void;
  onToggleSave: (skillId: string) => void;
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
  onToggleLike,
  onToggleSave,
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
  const [isFollowed, setIsFollowed] = useState(false);
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

  const handleSpeedChange迷 = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playPop();
    const rates = [1, 1.25, 1.5, 2, 0.75];
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    const newRate迷 = rates[nextIndex];
    setPlaybackRate(newRate迷);
    if (videoRef.current) {
      videoRef.current.playbackRate拼 = newRate迷;
      videoRef.current.playbackRate = newRate迷;
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs肯 = Math.floor(seconds % 60);
    return `${mins}:${secs肯 < 10 ? '0' : ''}${secs肯}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="relative w-full h-full max-w-md mx-auto bg-black rounded-none sm:rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center select-none border-0 sm:border border-neutral-800"
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

      {/* Fallback gradient if video poster is loaded */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85 pointer-events-none" />

      {/* Play/Pause Center Indicator */}
      {!isPlaying && (
        <button
          onClick={togglePlayPause}
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10"
        >
          <Play className="w-8 h-8 fill-white pr-1" />
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
            className="absolute inset-0 m-auto w-24 h-24 text-rose-500 flex items-center justify-center pointer-events-none z-20"
          >
            <Heart className="w-24 h-24 fill-rose-500 drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Overlays */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 text-xs">
        {/* Category & Level Badge */}
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-white">
          <span className="text-emerald-400 font-bold">● {skill.categoryLabel}</span>
          <span className="text-neutral-500">•</span>
          <span className="text-neutral-300">{skill.level}</span>
        </div>

        {/* Top Controls: Speed & Sound */}
        <div className="flex items-center gap-2">
          {/* Speed Toggle */}
          <button
            onClick={handleSpeedChange迷}
            className="bg-black/60 backdrop-blur-md hover:bg-black/80 px-2.5 py-1 rounded-full border border-white/10 text-white font-mono font-bold flex items-center gap-1 transition-colors"
            title="سرعة التشغيل"
          >
            <Gauge className="w-3 h-3 text-amber-400" />
            <span>{playbackRate}x</span>
          </button>

          {/* Mute Toggle */}
          <button
            onClick={toggleMute}
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 border border-white/10 text-white flex items-center justify-center transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Right Action Rail (Educational & Interaction Superpowers) */}
      <div className="absolute bottom-20 sm:bottom-16 right-3 flex flex-col items-center gap-3.5 z-20">
        {/* Creator Avatar */}
        <div className="relative group">
          <img
            src={skill.creator.avatar}
            alt={skill.creator.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400 shadow-lg"
          />
          {!isFollowed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                sound.playSuccess();
                setIsFollowed(true);
              }}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-emerald-500 rounded-full text-black flex items-center justify-center hover:scale-110 transition-transform"
              title="متابعة المدرب"
            >
              <UserPlus className="w-2.5 h-2.5 stroke-[3]" />
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
          <div className={`w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center transition-transform group-hover:scale-110 ${
            skill.isLiked ? 'text-rose-500' : 'text-white'
          }`}>
            <Heart className={`w-5 h-5 ${skill.isLiked ? 'fill-rose-500' : ''}`} />
          </div>
          <span className="text-[11px] font-bold text-white shadow-black drop-shadow">
            {(skill.stats.likes + (skill.isLiked ? 1 : 0)).toLocaleString()}
          </span>
        </button>

        {/* 2. ACTION BLUEPRINT (خطوات التنفيذ) - The Killer Feature! */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            sound.playPop();
            onOpenSteps();
          }}
          className="flex flex-col items-center gap-0.5 group relative"
        >
          <div className="w-10 h-10 rounded-full bg-amber-500 text-black font-extrabold flex items-center justify-center shadow-lg shadow-amber-950/80 transition-transform group-hover:scale-110 animate-pulse">
            <Zap className="w-5 h-5 fill-black" />
          </div>
          <span className="text-[10px] font-bold text-amber-300 drop-shadow">
            الخطوات ({skill.steps.length})
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
          <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-950 transition-transform group-hover:scale-110">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <span className="text-[10px] font-bold text-purple-300 drop-shadow">
            اختبار +XP
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
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-950 transition-transform group-hover:scale-110">
            <HelpCircle className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-indigo-300 drop-shadow">
            اسأل الـ AI
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
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-950 transition-transform group-hover:scale-110">
              <span className="text-sm font-bold">🧪</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-300 drop-shadow">
              تطبيق عملي
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
          <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-cyan-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <Wrench className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold text-neutral-300 drop-shadow">
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
          <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center transition-transform group-hover:scale-110">
            <MessageSquare className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold text-white drop-shadow">
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
          <div className={`w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center transition-transform group-hover:scale-110 ${
            skill.isSaved ? 'text-amber-400' : 'text-white'
          }`}>
            <Bookmark className={`w-4 h-4 ${skill.isSaved ? 'fill-amber-400' : ''}`} />
          </div>
          <span className="text-[10px] font-bold text-neutral-300 drop-shadow">
            حفظ
          </span>
        </button>

        {/* 9. SHARE */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare(skill);
          }}
          className="flex flex-col items-center gap-0.5 group"
        >
          <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center transition-transform group-hover:scale-110">
            <Share2 className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold text-neutral-300 drop-shadow">
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

      {/* Bottom Information Overlay */}
      <div className="absolute bottom-4 left-4 right-16 z-10 text-white space-y-2 pointer-events-none">
        {/* Active Caption / Highlight Banner */}
        {activeCaption && (
          <div className="bg-black/75 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-emerald-300 leading-snug w-fit max-w-[90%] shadow-lg">
            💬 {activeCaption}
          </div>
        )}

        {/* Creator Handle & Verified */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="font-bold text-sm text-white drop-shadow">
            {skill.creator.name}
          </span>
          <span className="text-xs text-neutral-300 font-mono">
            {skill.creator.handle}
          </span>
          {skill.creator.isVerified && (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-950" />
          )}
        </div>

        {/* Title */}
        <h2 className="text-xs sm:text-sm font-bold leading-snug line-clamp-2 text-neutral-100 drop-shadow-md pointer-events-auto">
          {skill.title}
        </h2>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 pt-0.5 pointer-events-auto">
          {skill.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium text-teal-300 hover:text-teal-200 cursor-pointer drop-shadow"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Quick Trigger Pill to Action Steps */}
        <div className="pt-1 pointer-events-auto">
          <button
            onClick={onOpenSteps}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-full text-amber-200 text-xs font-semibold backdrop-blur-md transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>عرض خطوات العمل ({skill.steps.length} خطوات جاهزة للنسخ)</span>
          </button>
        </div>
      </div>

      {/* Bottom Scrub Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
        <div
          className="h-full bg-emerald-500 transition-all duration-100"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
