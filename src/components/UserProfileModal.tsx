import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowRight,
  User, 
  Award, 
  Flame, 
  Sparkles, 
  Grid, 
  Bookmark, 
  Heart, 
  LogOut, 
  Edit3, 
  Check, 
  Shield, 
  Video, 
  Trash2,
  UserCheck,
  Zap,
  Play
} from 'lucide-react';
import { UserProfile } from '../services/firebase';
import { SkillVideo } from '../types';
import { useAuth } from '../context/AuthContext';
import { toggleFollowUser, deleteVideo } from '../services/dbOperations';
import { sound } from '../utils/audio';

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80';

export interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProfile?: UserProfile | SkillVideo['creator'] | any | null;
  userSkills?: SkillVideo[];
  savedSkills?: SkillVideo[];
  onSelectSkill?: (skillId: string) => void;
  onOpenAdminPanel?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  targetProfile,
  userSkills = [],
  savedSkills = [],
  onSelectSkill,
  onOpenAdminPanel,
}) => {
  const { currentUser, userProfile: myProfile, updateCurrentProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'videos' | 'saved' | 'stats'>('videos');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string>(FALLBACK_AVATAR);

  // Compute profile data safely with bulletproof fallback values
  const isMe = !targetProfile || (currentUser?.uid && (targetProfile.uid === currentUser.uid || targetProfile.handle === myProfile?.handle));

  const resolvedName = targetProfile?.name || (isMe ? myProfile?.name : null) || 'مستخدم مهارة';
  const resolvedHandle = targetProfile?.handle || (isMe ? myProfile?.handle : null) || '@mahara_creator';
  const resolvedBio = targetProfile?.bio || (isMe ? myProfile?.bio : null) || (targetProfile?.title ? `صانع محتوى مهارات • ${targetProfile.title}` : 'شغوف بتعلم ومشاركة المهارات العملية.');
  const resolvedAvatar = targetProfile?.avatar || (isMe ? myProfile?.avatar : null) || `https://api.dicebear.com/7.x/bottts/svg?seed=${resolvedHandle}`;
  const resolvedIsVerified = targetProfile?.isVerified ?? (isMe ? myProfile?.isVerified : false) ?? true;
  const resolvedRole = (targetProfile as any)?.role || (isMe ? myProfile?.role : 'user') || 'user';
  const resolvedFollowers = targetProfile?.followersCount || (isMe && myProfile?.followers ? myProfile.followers.length.toString() : '1.4K');
  const resolvedFollowing = (targetProfile as any)?.followingCount || (isMe && myProfile?.following ? myProfile.following.length.toString() : '48');
  const resolvedStreak = (targetProfile as any)?.streakDays || (isMe ? myProfile?.streakDays : null) || 4;
  const resolvedXp = (targetProfile as any)?.xp || (isMe ? myProfile?.xp : null) || 320;
  const resolvedLevel = (targetProfile as any)?.level || (isMe ? myProfile?.level : null) || 2;

  useEffect(() => {
    setEditName(resolvedName);
    setEditBio(resolvedBio);
    setEditAvatar(resolvedAvatar);
    setAvatarSrc(resolvedAvatar || FALLBACK_AVATAR);

    if (myProfile && targetProfile?.handle) {
      setIsFollowing(myProfile.following?.includes(targetProfile.handle) || false);
    } else if (myProfile && targetProfile?.uid) {
      setIsFollowing(myProfile.following?.includes(targetProfile.uid) || false);
    }
  }, [targetProfile, myProfile, resolvedName, resolvedBio, resolvedAvatar]);

  if (!isOpen) return null;

  const handleFollowToggle = async () => {
    if (!currentUser || !myProfile) return;
    sound.playPop();
    setIsLoadingFollow(true);
    try {
      const followKey = targetProfile?.handle || targetProfile?.uid || resolvedHandle;
      await toggleFollowUser(currentUser.uid, followKey);
      setIsFollowing(!isFollowing);
    } catch (e) {
      console.error('Follow toggle error:', e);
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const handleSaveProfile = async () => {
    sound.playSuccess();
    try {
      await updateCurrentProfile({
        name: editName.trim() || resolvedName,
        bio: editBio.trim() || resolvedBio,
        avatar: editAvatar.trim() || resolvedAvatar,
      });
    } catch (e) {
      console.error('Profile update error:', e);
    }
    setIsEditing(false);
  };

  const handleDeleteVideo = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الفيديو نهائياً من مهارة؟')) {
      sound.playPop();
      try {
        await deleteVideo(videoId);
      } catch (err) {
        console.error('Delete video error:', err);
      }
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg max-h-[92vh] bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Top Banner */}
          <div className="h-28 sm:h-32 bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-900 relative flex-shrink-0">
            {/* Top Navigation Controls */}
            <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
              <button
                onClick={() => {
                  sound.playPop();
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 text-xs font-bold transition-all shadow-lg"
                title="إغلاق"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>رجوع</span>
              </button>
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              {isMe && resolvedRole === 'admin' && onOpenAdminPanel && (
                <button
                  onClick={() => {
                    sound.playPop();
                    onOpenAdminPanel();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold shadow-lg transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>لوحة الإدارة</span>
                </button>
              )}

              {isMe && currentUser && (
                <button
                  onClick={async () => {
                    sound.playPop();
                    await logout();
                    onClose();
                  }}
                  className="p-2 rounded-full bg-black/50 hover:bg-rose-950/80 text-rose-300 backdrop-blur-md border border-white/10 transition-colors shadow-lg"
                  title="تسجيل خروج"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Profile Header Content */}
          <div className="px-5 pt-0 pb-3 relative flex-shrink-0 border-b border-neutral-800/90 bg-neutral-900">
            <div className="flex justify-between items-end -mt-10 sm:-mt-12 mb-3">
              {/* Avatar with Error Handling */}
              <div className="relative">
                <img
                  src={avatarSrc}
                  onError={() => setAvatarSrc(FALLBACK_AVATAR)}
                  alt={resolvedName}
                  className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl border-4 border-neutral-900 object-cover shadow-xl bg-neutral-800"
                />
                {resolvedIsVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-black p-1 rounded-full shadow-lg" title="صانع موثق">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Action Buttons: Edit or Follow */}
              <div>
                {isMe ? (
                  <button
                    onClick={() => {
                      sound.playPop();
                      setIsEditing(!isEditing);
                    }}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-colors shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isEditing ? 'إلغاء التعديل' : 'تعديل الملف'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleFollowToggle}
                    disabled={isLoadingFollow}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all ${
                      isFollowing
                        ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-black font-bold'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>تتابعه</span>
                      </>
                    ) : (
                      <>
                        <User className="w-3.5 h-3.5" />
                        <span>متابعة</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Profile Editing Form */}
            {isEditing ? (
              <div className="space-y-2.5 my-2 p-3 bg-neutral-950 rounded-2xl border border-neutral-800 text-xs">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">الاسم الكامل</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">النبذة التعريفية (Bio)</label>
                  <textarea
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">رابط الصورة الرمزية (Avatar URL)</label>
                  <input
                    type="text"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px] focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleSaveProfile}
                  className="w-full py-2 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors shadow-md"
                >
                  حفظ التعديلات
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-base sm:text-lg font-extrabold text-white">
                    {resolvedName}
                  </h3>
                  <span className="text-xs font-mono text-neutral-400" dir="ltr">
                    {resolvedHandle}
                  </span>
                </div>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                  {resolvedBio}
                </p>
              </div>
            )}

            {/* Metrics & Badges Counters */}
            <div className="flex items-center gap-4 sm:gap-6 mt-3 pt-2.5 border-t border-neutral-800/80 text-xs">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-white text-sm">{resolvedFollowers}</span>
                <span className="text-neutral-400 text-[11px]">متابع</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-white text-sm">{resolvedFollowing}</span>
                <span className="text-neutral-400 text-[11px]">يتابع</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-amber-400 text-sm flex items-center gap-0.5">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  {resolvedStreak}
                </span>
                <span className="text-neutral-400 text-[11px]">أيام سلسلة</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-purple-400 text-sm flex items-center gap-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {resolvedXp}
                </span>
                <span className="text-neutral-400 text-[11px]">XP</span>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-neutral-800 bg-neutral-950/80 flex-shrink-0 text-xs font-bold">
            <button
              onClick={() => {
                sound.playPop();
                setActiveTab('videos');
              }}
              className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'videos'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>المهارات ({userSkills.length})</span>
            </button>

            {isMe && (
              <button
                onClick={() => {
                  sound.playPop();
                  setActiveTab('saved');
                }}
                className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                  activeTab === 'saved'
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>المحفوظات ({savedSkills.length})</span>
              </button>
            )}

            <button
              onClick={() => {
                sound.playPop();
                setActiveTab('stats');
              }}
              className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'stats'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>الرتبة والإنجازات</span>
            </button>
          </div>

          {/* Tab Content List */}
          <div className="flex-1 overflow-y-auto p-3.5 custom-scrollbar min-h-[220px]">
            {/* 1. Videos Tab */}
            {activeTab === 'videos' && (
              <>
                {userSkills.length === 0 ? (
                  <div className="text-center py-10 text-neutral-500 text-xs">
                    <Video className="w-8 h-8 mx-auto mb-2 opacity-40 text-neutral-400" />
                    <p>لم يتم نشر أي فيديوهات تعليمية بعد.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {userSkills.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => {
                          if (onSelectSkill) {
                            sound.playPop();
                            onSelectSkill(v.id);
                            onClose();
                          }
                        }}
                        className="group relative aspect-[9/13] rounded-xl overflow-hidden bg-neutral-800 cursor-pointer border border-neutral-800 hover:border-emerald-500/50 transition-all shadow-md"
                      >
                        <img
                          src={v.posterUrl || FALLBACK_POSTER}
                          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_POSTER; }}
                          alt={v.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-2">
                          <p className="text-[11px] font-bold text-white line-clamp-2 leading-tight">
                            {v.title}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-neutral-300">
                            <span className="flex items-center gap-0.5">
                              <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                              {v.stats?.likes || 0}
                            </span>
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-bold">
                              {v.categoryLabel || 'مهارة'}
                            </span>
                          </div>
                        </div>

                        {/* Owner delete button */}
                        {isMe && (
                          <button
                            onClick={(e) => handleDeleteVideo(v.id, e)}
                            className="absolute top-1.5 left-1.5 p-1 rounded-md bg-black/70 hover:bg-rose-600 text-neutral-300 hover:text-white transition-colors"
                            title="حذف الفيديو"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* 2. Saved Tab */}
            {activeTab === 'saved' && (
              <>
                {savedSkills.length === 0 ? (
                  <div className="text-center py-10 text-neutral-500 text-xs">
                    <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-40 text-neutral-400" />
                    <p>حقيبتك فارغة حالياً. احفظ المهارات التي تود تطبيقها لاحقاً.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {savedSkills.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => {
                          if (onSelectSkill) {
                            sound.playPop();
                            onSelectSkill(v.id);
                            onClose();
                          }
                        }}
                        className="group relative aspect-[9/13] rounded-xl overflow-hidden bg-neutral-800 cursor-pointer border border-neutral-800 hover:border-amber-500/50 transition-all shadow-md"
                      >
                        <img
                          src={v.posterUrl || FALLBACK_POSTER}
                          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_POSTER; }}
                          alt={v.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-2">
                          <p className="text-[11px] font-bold text-white line-clamp-2 leading-tight">
                            {v.title}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-neutral-300">
                            <span className="text-[10px] text-neutral-300">
                              {v.creator?.name}
                            </span>
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-bold">
                              محفوظة
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* 3. Stats & Badges Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-neutral-400">الرتبة المهارية</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                      {resolvedLevel === 1 ? 'مبتدئ شغوف' : resolvedLevel === 2 ? 'مستكشف مهارات نشط' : 'محترف مهارات معتمد'}
                    </h4>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold text-base shadow-sm">
                    L{resolvedLevel}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex justify-between items-center text-neutral-300">
                    <span>مجموع نقاط الخبرة (XP)</span>
                    <span className="font-mono font-bold text-purple-400">{resolvedXp} XP</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, ((resolvedXp) % 500) / 5)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-500 text-left">
                    متبقي {500 - ((resolvedXp) % 500)} XP للوصول للمستوى التالي
                  </p>
                </div>

                {/* Badges */}
                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block mb-2 font-bold">الأوسمة المكتسبة</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2">
                      <span className="text-xl">🚀</span>
                      <div>
                        <div className="font-bold text-white text-[11px]">وسام الشغف الأول</div>
                        <div className="text-[9px] text-neutral-400">إتمام أول مهارة عملية</div>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2">
                      <span className="text-xl">🔥</span>
                      <div>
                        <div className="font-bold text-white text-[11px]">شعلة الاستمرار</div>
                        <div className="text-[9px] text-neutral-400">سلسلة 4 أيام متتالية</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
