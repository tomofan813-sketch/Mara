import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  Settings, 
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
  ExternalLink,
  UserCheck
} from 'lucide-react';
import { UserProfile, VideoDoc } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { toggleFollowUser, deleteVideo } from '../services/dbOperations';
import { sound } from '../utils/audio';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProfile: UserProfile | null;
  userVideos: VideoDoc[];
  onOpenVideo?: (video: VideoDoc) => void;
  onOpenAdminPanel?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  targetProfile,
  userVideos,
  onOpenVideo,
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

  const profile = targetProfile || myProfile;
  const isMe = currentUser?.uid === profile?.uid;

  useEffect(() => {
    if (profile) {
      setEditName(profile.name || '');
      setEditBio(profile.bio || '');
      setEditAvatar(profile.avatar || '');
      if (myProfile && profile.uid) {
        setIsFollowing(profile.followers?.includes(myProfile.uid) || false);
      }
    }
  }, [profile, myProfile]);

  if (!isOpen || !profile) return null;

  const handleFollowToggle = async () => {
    if (!currentUser || !myProfile) return;
    sound.playPop();
    setIsLoadingFollow(true);
    try {
      await toggleFollowUser(currentUser.uid, profile.uid);
      setIsFollowing(!isFollowing);
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const handleSaveProfile = async () => {
    sound.playSuccess();
    await updateCurrentProfile({
      name: editName.trim(),
      bio: editBio.trim(),
      avatar: editAvatar.trim() || profile.avatar,
    });
    setIsEditing(false);
  };

  const handleDeleteVideo = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الفيديو نهائياً من مهارة؟')) {
      sound.playPop();
      await deleteVideo(videoId);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Cover / Header Banner */}
          <div className="h-28 bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-800 relative flex-shrink-0">
            {/* Action buttons on top */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playPop();
                  onClose();
                }}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-2">
              {isMe && profile.role === 'admin' && onOpenAdminPanel && (
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

              {isMe && (
                <button
                  onClick={async () => {
                    sound.playPop();
                    await logout();
                    onClose();
                  }}
                  className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-rose-300 backdrop-blur-sm transition-colors"
                  title="تسجيل خروج"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Profile Header info */}
          <div className="px-5 pt-0 pb-4 relative flex-shrink-0 border-b border-neutral-800">
            <div className="flex justify-between items-end -mt-12 mb-3">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={profile.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt={profile.name}
                  className="w-20 h-20 rounded-2xl border-4 border-neutral-900 object-cover shadow-xl bg-neutral-800"
                />
                {profile.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-black p-1 rounded-full shadow">
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
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isEditing ? 'إلغاء' : 'تعديل الملف'}</span>
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

            {/* Editing Form */}
            {isEditing ? (
              <div className="space-y-2.5 my-2 p-3 bg-neutral-950 rounded-2xl border border-neutral-800 text-xs">
                <div>
                  <label className="text-[11px] text-neutral-400">الاسم</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400">النبذة التعريفية</label>
                  <textarea
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400">رابط الصورة الرمزية (Avatar URL)</label>
                  <input
                    type="text"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px]"
                  />
                </div>
                <button
                  onClick={handleSaveProfile}
                  className="w-full py-2 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors"
                >
                  حفظ التعديلات
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                  <span>{profile.name}</span>
                  <span className="text-xs font-mono font-normal text-neutral-400">{profile.handle}</span>
                </h3>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Social Stats Counters */}
            <div className="flex items-center gap-4 sm:gap-6 mt-3.5 pt-3 border-t border-neutral-800/80 text-xs">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-white text-sm">{profile.followersCount || 0}</span>
                <span className="text-neutral-400 text-[11px]">متابع</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-white text-sm">{profile.followingCount || 0}</span>
                <span className="text-neutral-400 text-[11px]">يتابع</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-amber-400 text-sm flex items-center gap-0.5">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  {profile.streakDays || 1}
                </span>
                <span className="text-neutral-400 text-[11px]">أيام سلسلة</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-purple-400 text-sm flex items-center gap-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {profile.xp || 150}
                </span>
                <span className="text-neutral-400 text-[11px]">XP</span>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-neutral-800 bg-neutral-950/60 flex-shrink-0 text-xs font-bold">
            <button
              onClick={() => {
                sound.playPop();
                setActiveTab('videos');
              }}
              className={`flex-1 py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'videos'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>فيديوهات المهارات ({userVideos.length})</span>
            </button>

            <button
              onClick={() => {
                sound.playPop();
                setActiveTab('stats');
              }}
              className={`flex-1 py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'stats'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>الإنجازات والرتب</span>
            </button>
          </div>

          {/* Tab Content List */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {activeTab === 'videos' && (
              <>
                {userVideos.length === 0 ? (
                  <div className="text-center py-10 text-neutral-500 text-xs">
                    <Video className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>لم يتم نشر أي فيديوهات تعليمية بعد.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {userVideos.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => {
                          if (onOpenVideo) onOpenVideo(v);
                        }}
                        className="group relative aspect-[9/14] rounded-xl overflow-hidden bg-neutral-800 cursor-pointer border border-neutral-800 hover:border-emerald-500/50 transition-all shadow-md"
                      >
                        <img
                          src={v.posterUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80'}
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
                              {v.likesCount || 0}
                            </span>
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded">
                              {v.categoryLabel || 'مهارة'}
                            </span>
                          </div>
                        </div>

                        {/* Delete button for owner */}
                        {isMe && (
                          <button
                            onClick={(e) => handleDeleteVideo(v.id, e)}
                            className="absolute top-1.5 left-1.5 p-1 rounded-md bg-black/60 hover:bg-rose-600 text-neutral-300 hover:text-white transition-colors"
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

            {activeTab === 'stats' && (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-neutral-400">الرتبة المهارية</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                      {profile.level === 1 ? 'مبتدئ شغوف' : profile.level === 2 ? 'مستكشف مهارات نشط' : 'محترف مهارات معتمد'}
                    </h4>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold text-base">
                    L{profile.level || 1}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex justify-between items-center text-neutral-300">
                    <span>مجموع نقاط XP المكتسبة</span>
                    <span className="font-mono font-bold text-purple-400">{profile.xp || 150} XP</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full"
                      style={{ width: `${Math.min(100, ((profile.xp || 150) % 500) / 5)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-500 text-left">
                    متبقي {500 - ((profile.xp || 150) % 500)} XP للترقية التالية
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
